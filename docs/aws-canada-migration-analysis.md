# Mike → AWS (Canada) Migration Analysis

_Goal: move front-end (Cloudflare Worker), file hosting (Cloudflare R2) and backend (Railway) to AWS, with all data resident in Canada (`ca-central-1`, Montreal)._

## 1. Current architecture (as built)

| Layer | Current | Tech detail |
|---|---|---|
| Frontend | Cloudflare Worker | Next.js 16 / React 19, built via `@opennextjs/cloudflare` (OpenNext), `wrangler.jsonc` name `mike`. Talks to backend via `NEXT_PUBLIC_API_BASE_URL`. Auth client-side via Supabase. |
| File storage | Cloudflare R2 | S3-compatible, accessed with `@aws-sdk/client-s3`, `region: "auto"`, path-style. Keys: `documents/{userId}/{docId}/...`, `generated/...`. Pre-signed URLs for download. |
| Backend | Railway | Express (Node), nixpacks, **bundles LibreOffice** (`nixPkgs=["libreoffice"]`) for docx/pdf conversion. |
| Database + Auth | **Supabase** (NOT mentioned in the ask) | Postgres + GoTrue auth. Service-role key server-side; JWT verification per request. This is where document metadata, chat history, projects, usage and **user PII** live. |
| AI inference | AWS Bedrock + Google Gemini | Bedrock client region `ca-central-1` but model IDs are `us.anthropic.*` → **inference runs in US**. Gemini → Google US. |
| Email | Resend | US-based transactional email. |
| External | CourtListener | US legal API (read-only case law). |

## 2. The data-residency truth

"All files in Canada" is incomplete. Actual customer data spread across:

1. **R2 objects** — source docs, generated docx, PDFs. (The "files".)
2. **Supabase Postgres** — metadata, chat transcripts, project content, usage, **auth/PII**. This is arguably more sensitive than the files and is the bigger residency item.
3. **AI inference** — Bedrock `us.*` cross-region routes prompts (= document contents) to US data centers. Gemini → US.
4. **Email** — Resend processes recipient PII in US.

To honestly claim Canadian residency you must address all four, not just R2.

## 3. Target AWS architecture (ca-central-1)

- **Files:** R2 → **S3** bucket in `ca-central-1`.
- **Backend:** Railway → **ECS Fargate** (recommended) or **App Runner** / EB. Must support the LibreOffice native dependency → custom Docker image.
- **Frontend:** Cloudflare Worker → **AWS Amplify Hosting** OR **OpenNext AWS adapter (SST) on Lambda + CloudFront + S3**.
- **DB + Auth:** Supabase → either (a) keep Supabase but pin project to `ca-central-1`, or (b) full AWS: **RDS/Aurora Postgres (ca-central-1) + Cognito**.
- **AI:** switch Bedrock to in-region inference profile available in `ca-central-1`; reassess Gemini (no Canadian region — likely drop or replace).
- **Email:** Resend → **Amazon SES** (ca-central-1 available).

## 4. Component-by-component migration

### 4.1 R2 → S3 (easiest — low risk)
- Code already uses `@aws-sdk/client-s3`. Change client config in `backend/src/lib/storage.ts`: drop `endpoint`/`forcePathStyle`, set `region: "ca-central-1"`, use AWS creds.
- Migrate objects: `aws s3 sync` from R2 (via rclone or S3 API) → S3.
- Pre-signed URL logic is identical (native S3 feature).
- Bucket: block public access, SSE-S3/KMS encryption, versioning, lifecycle rules.
- Effort: ~0.5–1 day code + transfer time for object copy.

### 4.2 Railway → ECS Fargate (medium — main effort)
- Containerize: write a `Dockerfile` (node:22 + `apt-get install libreoffice`). nixpacks doesn't carry over.
- Push image to **ECR**.
- **ECS Fargate** service behind an **ALB**, in a VPC across 2 AZs in ca-central-1.
- Env/secrets → **AWS Secrets Manager** / SSM Parameter Store (currently Railway env vars).
- IAM task role for S3 + Bedrock + SES (replaces static keys).
- LibreOffice is memory/CPU heavy → size tasks ≥1 vCPU / 2GB; conversions are sync and can spike.
- Health check endpoint, autoscaling on CPU.
- Effort: ~2–4 days. Cheaper/faster alt: **App Runner** (handles ALB/scaling for you) if the LibreOffice image fits its limits.

### 4.3 Cloudflare Worker → AWS (medium — most fiddly)
The frontend is built specifically for Cloudflare via `@opennextjs/cloudflare`. Two real paths:
- **Option A — Amplify Hosting:** Amplify now supports Next.js SSR natively. Drop OpenNext-CF, deploy with Amplify's Next build. Least custom infra; pin to ca-central-1.
- **Option B — OpenNext AWS adapter (SST/`open-next`):** swap `@opennextjs/cloudflare` for the original `open-next` AWS target → Lambda (SSR) + CloudFront + S3 (assets). More control, more setup.
- Either way: edge runtime APIs (if any) must be removed; verify no Workers-specific bindings are used (none found — only `ASSETS` binding).
- Note: CloudFront/Amplify edge is global by design; the SSR compute and origin can be pinned to ca-central-1. Static assets at edge are fine (no PII in static).
- Effort: ~2–3 days incl. build pipeline.

### 4.4 Supabase → decision point (highest-impact)
- **Keep Supabase, pin region:** verify/migrate the Supabase project to `ca-central-1` (Supabase offers Canada Central). Cheapest, least code change — auth + DB stay as-is. If the project is already in ca-central, **DB residency may already be satisfied** and only files/compute move. *Verify current region first.*
- **Full AWS:** Aurora/RDS Postgres (ca-central-1) + migrate auth to **Cognito**. This is a large project: rewrite all `getUserIdFromRequest`/JWT logic, frontend `@supabase/auth-helpers`, RLS → app-level authz, data migration. Weeks of work. Only do this if "must be 100% AWS" is a hard requirement.
- **Recommendation:** keep Supabase pinned to Canada unless contract requires single-vendor AWS.

### 4.5 AI inference residency (often overlooked)
- Bedrock: replace `us.anthropic.*` model IDs with a **ca-central-1**-available model / inference profile so prompts stay in Canada. Note model availability in ca-central-1 is narrower than us-east-1 — confirm the specific Claude models you use are offered there; this may constrain model choice.
- **Gemini:** no Canadian residency → likely must drop Gemini or replace with a Bedrock-hosted equivalent. Flag for product decision.
- This is the difference between "files in Canada" and "data never leaves Canada".

### 4.6 Email
- Resend → **Amazon SES** in ca-central-1. Re-verify domain, move templates, swap the `resend` SDK calls (only 1 usage site). Low effort.

## 5. Effort & risk summary

- **Low / quick:** R2→S3, Resend→SES.
- **Medium:** Railway→Fargate (LibreOffice image), Worker→Amplify.
- **High / decision-gated:** Supabase→RDS+Cognito (only if required), Gemini removal, Bedrock model-availability constraints.

Biggest risks:
1. **LibreOffice on Fargate** — cold conversions, memory, fonts. Test early.
2. **Bedrock model availability in ca-central-1** — may force a model change.
3. **Supabase scope creep** — easy to under-scope if "all data in Canada" actually means migrating auth.
4. Frontend SSR edge-runtime assumptions baked in by OpenNext-CF.

## 6. Recommended phased plan

1. **Phase 0 — Confirm residency requirements:** Is it "files in Canada" or "no data leaves Canada"? Determines Supabase + AI scope. Check current Supabase project region.
2. **Phase 1 — Storage:** R2 → S3 ca-central-1. Ship, verify uploads/downloads/signed URLs.
3. **Phase 2 — Backend:** Dockerize + ECS Fargate + ALB + Secrets Manager + IAM roles. Cut over `NEXT_PUBLIC_API_BASE_URL`.
4. **Phase 3 — Frontend:** Amplify Hosting (or OpenNext-AWS). Point domain.
5. **Phase 4 — AI + email:** Bedrock in-region profile, SES, Gemini decision.
6. **Phase 5 — DB (only if required):** Supabase region pin OR RDS+Cognito migration.

## 7. Cost notes
- Fargate + ALB + NAT + S3 + CloudFront will likely cost **more** than Railway + R2 (R2 has zero egress fees; S3/CloudFront egress is billed). Budget for NAT Gateway (~$32/mo) and CloudFront/S3 egress.
- Aurora Serverless v2 if going full-AWS DB — non-trivial baseline cost vs Supabase free/pro.

---
_Open question to resolve first: exact residency standard, and current Supabase project region._
