"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, Loader2, Search } from "lucide-react";
import {
    listDocumentTemplates,
    createDocumentFromTemplate,
    type DocumentTemplate,
} from "@/app/lib/mikeApi";
import type { Document } from "./types";
import { Modal } from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
    /** Called with the freshly instantiated document (attach it to the chat). */
    onInstantiated: (doc: Document) => void;
    projectId?: string | null;
    folderId?: string | null;
}

const AUDIENCE_ORDER = [
    "founders",
    "employees",
    "freelancers",
    "other-collaborators",
] as const;

const AUDIENCE_LABELS: Record<(typeof AUDIENCE_ORDER)[number], string> = {
    founders: "Founders",
    employees: "Employees",
    freelancers: "Freelancers",
    "other-collaborators": "Other collaborators",
};

interface TemplateRow {
    agreementKey: string;
    agreementLabel: string;
    order: number;
    en: DocumentTemplate | null;
    fr: DocumentTemplate | null;
}

interface AudienceGroup {
    audience: string;
    label: string;
    rows: TemplateRow[];
}

export function TemplatePickerModal({
    open,
    onClose,
    onInstantiated,
    projectId,
    folderId,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [search, setSearch] = useState("");
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setSearch("");
        setActionError(null);
        setPendingId(null);
        setLoading(true);
        setLoadError(null);
        listDocumentTemplates()
            .then((list) => setTemplates(list))
            .catch((err) => {
                console.error("Failed to load templates:", err);
                setLoadError("Could not load templates. Please try again.");
            })
            .finally(() => setLoading(false));
    }, [open]);

    // Group by audience, then by agreement, pairing the EN/FR variants of
    // the same agreement into one row. Built from the unfiltered list so
    // search (below) can never split a pair across columns.
    const groups = useMemo<AudienceGroup[]>(() => {
        const byAudience = new Map<string, Map<string, TemplateRow>>();
        for (const t of templates) {
            let rows = byAudience.get(t.audience);
            if (!rows) {
                rows = new Map<string, TemplateRow>();
                byAudience.set(t.audience, rows);
            }
            const row =
                rows.get(t.agreementKey) ??
                ({
                    agreementKey: t.agreementKey,
                    agreementLabel: t.agreementLabel,
                    order: t.agreementOrder,
                    en: null,
                    fr: null,
                } as TemplateRow);
            // Unrecognized languages fall into the EN slot rather than
            // disappearing from the grid.
            if (t.language === "fr") row.fr = t;
            else row.en = t;
            rows.set(t.agreementKey, row);
        }

        const known = AUDIENCE_ORDER.filter((a) => byAudience.has(a));
        const unknown = Array.from(byAudience.keys()).filter(
            (a) => !(AUDIENCE_ORDER as readonly string[]).includes(a),
        );

        return [...known, ...unknown].map((audience) => ({
            audience,
            label:
                AUDIENCE_LABELS[audience as (typeof AUDIENCE_ORDER)[number]] ??
                audience,
            rows: Array.from(byAudience.get(audience)!.values()).sort(
                (a, b) => a.order - b.order,
            ),
        }));
    }, [templates]);

    // Filter whole rows (not individual cards) so a matching agreement keeps
    // both its EN and FR cards together, and an agreement label match (e.g.
    // "non-compete") can surface an FR-only card via English search.
    const visibleGroups = useMemo<AudienceGroup[]>(() => {
        const q = search.trim().toLowerCase();
        if (!q) return groups;
        const hit = (t: DocumentTemplate | null) =>
            !!t &&
            (t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q));
        return groups
            .map((g) => ({
                ...g,
                rows: g.rows.filter(
                    (r) =>
                        hit(r.en) ||
                        hit(r.fr) ||
                        r.agreementLabel.toLowerCase().includes(q) ||
                        g.label.toLowerCase().includes(q),
                ),
            }))
            .filter((g) => g.rows.length > 0);
    }, [groups, search]);

    const handlePick = async (template: DocumentTemplate) => {
        if (pendingId) return;
        setPendingId(template.id);
        setActionError(null);
        try {
            const doc = await createDocumentFromTemplate(template.id, {
                projectId: projectId ?? null,
                folderId: folderId ?? null,
            });
            onInstantiated(doc);
            onClose();
        } catch (err) {
            console.error("Failed to instantiate template:", err);
            setActionError(
                "Could not create a document from this template. Please try again.",
            );
        } finally {
            setPendingId(null);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Use a template"
            icon={<FileText className="h-5 w-5 text-gray-500" />}
            size="lg"
        >
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search templates…"
                        className="w-full pl-9 pr-3 h-9 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>

                {actionError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{actionError}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                ) : loadError ? (
                    <div className="flex items-center gap-2 py-10 justify-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{loadError}</span>
                    </div>
                ) : visibleGroups.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">
                        {search
                            ? "No matching templates"
                            : "No templates available"}
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {visibleGroups.map((g) => (
                            <div key={g.audience} className="flex flex-col gap-2">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {g.label}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {g.rows.map((r) => (
                                        <Fragment key={r.agreementKey}>
                                            {r.en ? (
                                                <TemplateCard
                                                    template={r.en}
                                                    pendingId={pendingId}
                                                    onPick={handlePick}
                                                />
                                            ) : (
                                                <ComingSoonCard language="en" />
                                            )}
                                            {r.fr ? (
                                                <TemplateCard
                                                    template={r.fr}
                                                    pendingId={pendingId}
                                                    onPick={handlePick}
                                                />
                                            ) : (
                                                <ComingSoonCard language="fr" />
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}

function TemplateCard({
    template,
    pendingId,
    onPick,
}: {
    template: DocumentTemplate;
    pendingId: string | null;
    onPick: (template: DocumentTemplate) => void;
}) {
    const isPending = pendingId === template.id;
    return (
        <button
            type="button"
            disabled={!!pendingId}
            onClick={() => onPick(template)}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 text-left transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <div className="mt-0.5">
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                    <FileText className="h-4 w-4 text-gray-500" />
                )}
            </div>
            <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className="text-sm font-medium text-gray-900 truncate">
                        {template.title}
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                        {template.language === "fr" ? "FR" : "EN"}
                    </span>
                </div>
                <div className="text-xs text-gray-500 line-clamp-2">
                    {template.description}
                </div>
            </div>
        </button>
    );
}

function ComingSoonCard({ language }: { language: "en" | "fr" }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-left">
            <div className="mt-0.5">
                <FileText className="h-4 w-4 text-gray-300" />
            </div>
            <div className="min-w-0">
                <div className="text-sm font-medium text-gray-400">
                    {language === "fr" ? "French version" : "English version"}
                </div>
                <div className="text-xs text-gray-400">Coming soon</div>
            </div>
        </div>
    );
}
