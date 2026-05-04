# Mike — AWS Bedrock Integration

This document captures what was done, what was changed, and what still needs to happen before this project is production-ready. Written as a session recovery reference.

---

## Background

Mike is an open-source AI legal platform (forked from [willchen96/mike](https://github.com/willchen96/mike)) built with a Next.js frontend and an Express/TypeScript backend, using Supabase for auth and storage.

The original project expects each user to provide their own Anthropic and/or Google API keys, stored per-user in the database. We changed it to a **firm-hosted model**: AWS Bedrock credentials are injected as server-side environment variables, and employees use the firm's models without managing any API keys themselves.

---

## What Was Changed

### Backend

#### `backend/package.json`
- Added `@anthropic-ai/bedrock-sdk` dependency (Anthropic's official Bedrock SDK — same API surface as `@anthropic-ai/sdk` but authenticates via AWS credentials instead of an API key)

#### `backend/src/lib/llm/bedrock.ts` *(new file)*
- New provider adapter mirroring `claude.ts`
- Uses `AnthropicBedrock` client, authenticated via `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` env vars
- Falls back to the AWS credential provider chain (IAM role, `~/.aws/credentials`) if explicit keys aren't set
- Resolves logical model IDs (e.g. `bedrock-claude-sonnet-4-6`) to actual Bedrock cross-region inference IDs (e.g. `us.anthropic.claude-sonnet-4-6`) before calling the API
- Supports streaming, tool use, and extended thinking — identical loop to `claude.ts`

#### `backend/src/lib/llm/models.ts`
- Removed old `CLAUDE_MAIN_MODELS`, `CLAUDE_MID_MODELS`, `CLAUDE_LOW_MODELS` constants
- Added `BEDROCK_MODEL_ID_MAP` — maps logical IDs to real Bedrock model IDs:
  - `bedrock-claude-sonnet-4-6` → `us.anthropic.claude-sonnet-4-6`
  - `bedrock-claude-haiku-4-5` → `us.anthropic.claude-haiku-4-5-20251001-v1:0`
  - `bedrock-claude-opus-4-6` → `us.anthropic.claude-opus-4-6-v1` *(internal only, not user-selectable)*
- Added `BEDROCK_MAIN_MODELS` and `BEDROCK_LOW_MODELS` constants
- Updated all three defaults:
  - `DEFAULT_MAIN_MODEL` = `bedrock-claude-sonnet-4-6`
  - `DEFAULT_TABULAR_MODEL` = `bedrock-claude-haiku-4-5`
  - `DEFAULT_TITLE_MODEL` = `bedrock-claude-haiku-4-5`
- Updated `providerForModel()` to return `"bedrock"` for `bedrock-*` model IDs

#### `backend/src/lib/llm/types.ts`
- Added `"bedrock"` to the `Provider` union type
- Removed `claude` from `UserApiKeys` — no longer stored or passed per-user

#### `backend/src/lib/llm/index.ts`
- Imported `streamBedrock` and `completeBedrockText` from `./bedrock`
- Added `"bedrock"` branch to both `streamChatWithTools()` and `completeText()`

#### `backend/src/lib/userSettings.ts`
- Removed all references to `claude_api_key` from Supabase queries
- `resolveTitleModel()` now checks for AWS env vars first → defaults to Bedrock Haiku; falls back to Gemini if no AWS creds
- `getUserApiKeys()` and `getUserModelSettings()` now only read `gemini_api_key` from the DB

#### `backend/.env.example`
- Removed `ANTHROPIC_API_KEY`
- Added `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

#### `backend/.env` *(local only, gitignored)*
- Contains the actual AWS credentials (same account used by playbook-maker)
- `AWS_REGION=ca-central-1` — this is where your app contacts the AWS endpoint
- The inference region is determined by the model ID prefix (`us.anthropic.*` routes to US data centers regardless of your client region)
- All other values (Supabase, R2, etc.) are still placeholders — need to be filled in

#### `backend/migrations/001_bedrock_remove_claude_key.sql` *(new file)*
- Drops `claude_api_key` column from `user_profiles`
- Updates `tabular_model` column default to `bedrock-claude-haiku-4-5`
- Migrates any existing rows with old Claude or Gemini model IDs to the Bedrock equivalent

### Frontend

#### `frontend/src/app/components/assistant/ModelToggle.tsx`
- Replaced `"Anthropic"` group with `"Bedrock"` group
- `MODELS` array now contains:
  - `bedrock-claude-sonnet-4-6` — "Claude Sonnet 4.6" (Bedrock)
  - `bedrock-claude-haiku-4-5` — "Claude Haiku 4.5" (Bedrock)
  - `gemini-3.1-pro-preview` — "Gemini 3.1 Pro" (Google)
  - `gemini-3-flash-preview` — "Gemini 3 Flash" (Google)
- `DEFAULT_MODEL_ID` changed to `bedrock-claude-sonnet-4-6`
- `GROUP_ORDER` changed to `["Bedrock", "Google"]`
- Removed `AlertCircle` import and key-missing warning UI for Bedrock models (they're always available)

#### `frontend/src/app/lib/modelAvailability.ts`
- `ModelProvider` type is now `"bedrock" | "gemini"` (removed `"claude"`)
- `isModelAvailable()` returns `true` unconditionally for Bedrock models
- `modelGroupToProvider()` maps `"Bedrock"` → `"bedrock"`

#### `frontend/src/app/(pages)/account/models/page.tsx`
- Removed the Anthropic API key input field
- Kept the Google (Gemini) API key field (optional — only needed if firm wants to also expose Gemini)
- Tabular model dropdown still works; now only shows Bedrock and Gemini options

#### `frontend/src/contexts/UserProfileContext.tsx`
- Removed `claudeApiKey` from the `UserProfile` interface
- Removed `claude_api_key` from the Supabase `select` query
- Removed `claude` branch from `updateApiKey()`
- Updated all fallback profile objects to remove `claudeApiKey`

---

## What Still Needs to Be Done

### Before Local Testing

1. **Fill in `backend/.env`** — the following are still placeholders:
   - `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
   - `R2_ENDPOINT_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
   - `RESEND_API_KEY` (email — can be skipped for basic testing)
   - `GEMINI_API_KEY` (only needed if testing Gemini models)

2. **Set up Supabase project** — create a new Supabase project and:
   - Run `backend/migrations/000_one_shot_schema.sql` in the Supabase SQL editor (fresh DB setup)
   - Run `backend/migrations/001_bedrock_remove_claude_key.sql` after (removes `claude_api_key` column)
   - Copy the project URL and service role key into `.env`

3. **Set up Cloudflare R2 bucket** (or any S3-compatible storage) for document uploads
   - Create a bucket named `mike` (or update `R2_BUCKET_NAME`)
   - Fill in the R2 credentials in `.env`

4. **Install dependencies and verify TypeScript**:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   cd backend && npx tsc --noEmit
   ```

5. **Run locally**:
   ```bash
   npm run dev --prefix backend
   npm run dev --prefix frontend
   # Open http://localhost:3000
   ```

6. **Fill in `frontend/.env.local`** (copy from `frontend/.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
   - `SUPABASE_SECRET_KEY`
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`

### Testing Checklist

- [ ] Sign up / sign in works (Supabase auth)
- [ ] Can upload a document
- [ ] Chat with a document using Claude Sonnet 4.6 (Bedrock)
- [ ] Switch to Claude Haiku 4.5 in the model picker
- [ ] Tabular review runs with Bedrock Haiku
- [ ] Title generation works (uses Bedrock Haiku)
- [ ] Account → Models page shows no Anthropic API key field
- [ ] Gemini models show as unavailable (no key set) without breaking anything

### Before Firm-Wide Deployment

- [ ] Set up proper hosting (VPS, Railway, Fly.io, etc.)
- [ ] Configure environment variables on the host (do not commit `.env`)
- [ ] Decide on Supabase hosting (managed Supabase vs self-hosted)
- [ ] Set up email via Resend (used for document sharing notifications)
- [ ] Review and configure LibreOffice on the server (needed for DOC/DOCX → PDF conversion)
- [ ] Decide whether to expose Gemini models to employees (currently optional — just set `GEMINI_API_KEY` in env)
- [ ] Add LibreOffice install step to deployment docs

### Keeping Up With Upstream

The original repo (`willchen96/mike`) may receive security patches and feature updates. To pull them in:

```bash
# One-time setup (if not done)
git remote add upstream https://github.com/willchen96/mike.git

# When you want to sync
git fetch upstream
git merge upstream/main
```

Likely conflict points when merging upstream:
- `backend/src/lib/llm/claude.ts` — upstream may update this; our `bedrock.ts` mirrors it, so check for changes to copy over
- `backend/src/lib/llm/models.ts` — upstream will add/change model IDs; don't let it overwrite our Bedrock additions
- `frontend/src/app/components/assistant/ModelToggle.tsx` — upstream may add new models; keep our Bedrock group, integrate any Gemini additions
- `backend/src/lib/userSettings.ts` — upstream still references `claude_api_key`; keep our version

All other files (routes, auth, documents, workflows, tabular) can be merged cleanly — we didn't touch them.

---

## AWS Credentials Note

The AWS credentials in `.env` are shared with the `playbook-maker` project (same AWS account). The region is `ca-central-1` (where your app connects to AWS), but Claude model inference routes to US data centers via the `us.anthropic.*` model ID prefix — this is standard Bedrock cross-region inference and is intentional.

Make sure the IAM user/role associated with these credentials has the `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` permissions for the relevant model ARNs in us-east-1.
