import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createServerSupabase } from "../lib/supabase";
import { safeErrorLog } from "../lib/safeError";

export const usageRouter = Router();

// Admin allowlist for the all-users monthly report. Lowercased emails.
const ADMIN_EMAILS = new Set(["gfalardeau@leviatlegal.com"]);

/** Start of the current calendar month, UTC. */
function startOfCurrentMonthUtc(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
}

// ---------------------------------------------------------------------------
// GET /usage/me — current-month billed cost for the authenticated user.
// Resets automatically on the 1st (the query filters created_at >= month start).
// ---------------------------------------------------------------------------
usageRouter.get("/me", requireAuth, async (_req, res) => {
    const userId = res.locals.userId as string;
    const db = createServerSupabase();
    const monthStart = startOfCurrentMonthUtc();

    try {
        const { data, error } = await db
            .from("token_usage")
            .select("input_cost, output_cost, total_cost, input_tokens, output_tokens")
            .eq("user_id", userId)
            .gte("created_at", monthStart.toISOString());
        if (error) throw error;

        let totalCost = 0;
        let inputTokens = 0;
        let outputTokens = 0;
        for (const row of data ?? []) {
            totalCost += Number(row.total_cost) || 0;
            inputTokens += Number(row.input_tokens) || 0;
            outputTokens += Number(row.output_tokens) || 0;
        }

        res.json({
            month: monthStart.toISOString().slice(0, 7), // YYYY-MM
            total_cost: Math.round(totalCost * 100) / 100,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
        });
    } catch (err) {
        console.error("[usage/me] failed", safeErrorLog(err));
        res.status(500).json({ detail: "Failed to load usage" });
    }
});

// ---------------------------------------------------------------------------
// POST /usage/admin/send-monthly-report
// Admin-only. Computes PREVIOUS calendar month's billed cost per user and
// emails the summary to the admin via Resend. Designed to be triggered by a
// scheduler on the 1st of each month. Also callable manually by an admin.
//
// Optional body { month: "YYYY-MM" } overrides which month to report (defaults
// to the previous month relative to "now").
// ---------------------------------------------------------------------------
usageRouter.post("/admin/send-monthly-report", requireAuth, async (req, res) => {
    const email = (res.locals.userEmail as string) || "";
    if (!ADMIN_EMAILS.has(email)) {
        return void res.status(403).json({ detail: "Forbidden" });
    }

    try {
        const result = await sendMonthlyReport(
            typeof req.body?.month === "string" ? req.body.month : undefined,
        );
        res.json(result);
    } catch (err) {
        console.error("[usage/monthly-report] failed", safeErrorLog(err));
        res.status(500).json({ detail: "Failed to send monthly report" });
    }
});

// ---------------------------------------------------------------------------
// POST /usage/cron/send-monthly-report
// Secret-gated (no user session) entry point for the scheduler. Requires the
// X-Cron-Secret header to match USAGE_CRON_SECRET. Reports the previous month.
// ---------------------------------------------------------------------------
usageRouter.post("/cron/send-monthly-report", async (req, res) => {
    const secret = process.env.USAGE_CRON_SECRET || "";
    const provided =
        (req.headers["x-cron-secret"] as string | undefined) || "";
    if (!secret || provided !== secret) {
        return void res.status(403).json({ detail: "Forbidden" });
    }
    try {
        const result = await sendMonthlyReport(
            typeof req.body?.month === "string" ? req.body.month : undefined,
        );
        res.json(result);
    } catch (err) {
        console.error("[usage/monthly-report:cron] failed", safeErrorLog(err));
        res.status(500).json({ detail: "Failed to send monthly report" });
    }
});

// ---------------------------------------------------------------------------
// Shared report logic (also exported for the scheduled job).
// ---------------------------------------------------------------------------
type MonthlyReportResult = {
    month: string;
    userCount: number;
    grandTotal: number;
    emailed: boolean;
};

export async function sendMonthlyReport(
    monthOverride?: string,
): Promise<MonthlyReportResult> {
    const db = createServerSupabase();

    // Determine target month window [start, end).
    let start: Date;
    if (monthOverride && /^\d{4}-\d{2}$/.test(monthOverride)) {
        const [y, m] = monthOverride.split("-").map(Number);
        start = new Date(Date.UTC(y, m - 1, 1));
    } else {
        const now = new Date();
        // Previous month.
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    }
    const end = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
    );
    const monthLabel = start.toISOString().slice(0, 7);

    // Pull all rows in the window and aggregate per user in memory.
    const { data, error } = await db
        .from("token_usage")
        .select("user_id, total_cost, input_tokens, output_tokens")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());
    if (error) throw error;

    const perUser = new Map<
        string,
        { cost: number; inTok: number; outTok: number }
    >();
    let grandTotal = 0;
    for (const row of data ?? []) {
        const u = row.user_id as string;
        const agg = perUser.get(u) ?? { cost: 0, inTok: 0, outTok: 0 };
        agg.cost += Number(row.total_cost) || 0;
        agg.inTok += Number(row.input_tokens) || 0;
        agg.outTok += Number(row.output_tokens) || 0;
        perUser.set(u, agg);
        grandTotal += Number(row.total_cost) || 0;
    }

    // Resolve user emails / names for readability.
    const userIds = [...perUser.keys()];
    const nameById = new Map<string, string>();
    if (userIds.length) {
        const { data: profiles } = await db
            .from("user_profiles")
            .select("user_id, display_name, organisation")
            .in("user_id", userIds);
        for (const p of profiles ?? []) {
            const label =
                [p.display_name, p.organisation].filter(Boolean).join(" · ") ||
                (p.user_id as string);
            nameById.set(p.user_id as string, label);
        }
    }

    // Build sorted rows (highest cost first).
    const rows = userIds
        .map((id) => ({
            id,
            label: nameById.get(id) ?? id,
            ...perUser.get(id)!,
        }))
        .sort((a, b) => b.cost - a.cost);

    const fmt = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
    const tableRows = rows
        .map(
            (r) =>
                `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(
                    r.label,
                )}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${fmt(
                    r.cost,
                )}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;color:#888">${(
                    r.inTok + r.outTok
                ).toLocaleString()}</td></tr>`,
        )
        .join("");

    const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#02263f">
          <h2 style="margin-bottom:4px">Leviat Legal — Usage report</h2>
          <p style="color:#666;margin-top:0">Billed cost per user for <strong>${monthLabel}</strong></p>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <thead>
              <tr style="text-align:left;color:#666">
                <th style="padding:6px 12px;border-bottom:2px solid #02263f">User</th>
                <th style="padding:6px 12px;border-bottom:2px solid #02263f;text-align:right">Cost</th>
                <th style="padding:6px 12px;border-bottom:2px solid #02263f;text-align:right">Tokens</th>
              </tr>
            </thead>
            <tbody>${tableRows || '<tr><td colspan="3" style="padding:12px;color:#888">No usage recorded.</td></tr>'}</tbody>
            <tfoot>
              <tr style="font-weight:600">
                <td style="padding:8px 12px;border-top:2px solid #02263f">Total</td>
                <td style="padding:8px 12px;border-top:2px solid #02263f;text-align:right">${fmt(grandTotal)}</td>
                <td style="padding:8px 12px;border-top:2px solid #02263f"></td>
              </tr>
            </tfoot>
          </table>
          <p style="color:#aaa;font-size:12px;margin-top:24px">Costs reflect public list prices with the configured billing multiplier.</p>
        </div>`;

    const emailed = await sendViaResend({
        subject: `Leviat Legal usage — ${monthLabel} — ${fmt(grandTotal)}`,
        html,
    });

    return {
        month: monthLabel,
        userCount: rows.length,
        grandTotal: Math.round(grandTotal * 100) / 100,
        emailed,
    };
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function sendViaResend(opts: {
    subject: string;
    html: string;
}): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.USAGE_REPORT_FROM || "reports@leviatlegal.com";
    const to = process.env.USAGE_REPORT_TO || "gfalardeau@leviatlegal.com";
    if (!apiKey) {
        console.warn(
            "[usage/monthly-report] RESEND_API_KEY not set — skipping email send",
        );
        return false;
    }
    const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: `Leviat Legal <${from}>`,
            to: [to],
            subject: opts.subject,
            html: opts.html,
        }),
    });
    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        console.error(
            `[usage/monthly-report] Resend send failed ${resp.status}: ${text}`,
        );
        return false;
    }
    return true;
}
