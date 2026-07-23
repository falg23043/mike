# Template Bank — Implementation Plan (Option A)

**Status:** Draft for review — do NOT start coding until Guillaume approves.
**Author:** R. Giskard (analysis), for Guillaume / Leviat.
**Date:** 2026-07-22
**Repo:** `mike` (frontend Next.js + backend Express + Supabase + Cloudflare R2, Bedrock-only LLM)

---

## 1. Goal

Ship a set of default **agreement templates** that exist in every account out of the box, so a user can start a new document from a template **without uploading anything**. Primary entry point is the assistant chat's existing **"Documents"** button (`AddDocButton`): a new **"Use template"** item, sitting between "Upload files" and "Browse all", opens a dedicated picker showing the templates in the same card/grid UX as "Browse all". Selecting one **instantiates a private per-user copy** and attaches it to the chat, where the user types high-level requirements and the existing `edit_document` flow adapts it.

## 2. Confirmed decisions (locked)

1. **Format:** static `.docx` blobs stored in R2. (Preserves real legal formatting + tracked-changes.)
2. **v1 catalog — START WITH 1 TEMPLATE:**
   - **Employment Agreement** (`id: employment-agreement`) — the approved `.docx` has been supplied and is staged at `backend/templates-src/employment-agreement.docx`.
   - The remaining 5 (NDA, Freelancer Agreement, Services Agreement, Non-competition & Non-solicitation Agreement, Confidentiality & IP Assignment Agreement) are **deferred** — each is added later by dropping its `.docx` into `templates-src/`, adding one registry entry, and re-running the seed (registry change = code push; see §5 Phase 1 + §8 note). Nothing about the architecture changes when scaling from 1 to N.
3. **Instantiated doc name:** verbatim template title (e.g. "NDA"). Rename supported afterward.
4. **`source` tag:** reuse existing `'upload'` value — **no schema migration**.
5. **Hide/declutter list:** deferred (no `hidden_templates` table in v1).
6. **Assistant proactivity:** explicit-only. **Chat tools (`list_templates`/`create_from_template`) are OUT of scope for v1** — button/modal path only.
7. **UX:** dedicated `TemplatePickerModal` (option b), NOT overloading `AddDocumentsModal`.
8. **Landing spot when no project (global assistant chat):** create as a **standalone/single document** (same bucket as ad-hoc uploads), then attach to the chat.

## 3. Design summary & why it's low-risk

- Fully **additive**. No changes to existing routes' behavior, no provider/LLM changes, no Bedrock impact, no rearchitecture. Minimal upstream-merge conflict surface.
- Reuses two established patterns already in the codebase:
  - **Built-in workflows** (`frontend/src/app/components/workflows/builtinWorkflows.ts`, seeded in `backend/src/lib/chatTools.ts` `buildWorkflowStore`) — the "shipped by default, per account, `user_id: null`" precedent.
  - **Document instantiation** — `handleDocumentUpload` (`backend/src/routes/projects.ts:840`) creates a new `documents` row + V1 `document_versions` row + R2 blob + DOCX→PDF rendition. The new endpoint is a near-copy that swaps the byte source from an uploaded file to a system template blob in R2.

## 4. Storage layout

Templates live under a reserved **system** prefix, outside the per-user `documents/{userId}/...` namespace:

```
templates/system/{templateId}/source.docx
```

- `{templateId}` = stable slug from the registry (e.g. `nda`, `freelancer-agreement`).
- These blobs are uploaded once by a seed script (Phase 0). They are read-only at runtime; instantiation only ever **reads** them and writes a fresh copy into the user's `documents/{userId}/{newDocId}/...` space.

---

## 5. Implementation steps (file-by-file)

Steps are ordered so each phase is independently testable. Backend first (Phases 0–3), then frontend (Phases 4–7), then verification (Phase 8).

### Phase 0 — Template assets + one-shot seed

**Prereq (non-code):** DONE for v1 — the single approved Employment Agreement `.docx` is already staged at `backend/templates-src/employment-agreement.docx`. Future templates: drop their `.docx` into the same dir as `{slug}.docx`. The source of truth is R2; local files are just seed input. Decide whether to commit `backend/templates-src/` or add it to `.gitignore` (see Open Item §8.5).

**New file:** `backend/scripts/seed-templates.ts`
- Reads the registry from `builtinTemplates.ts` (Phase 1).
- For each registry entry (v1: just `employment-agreement`), reads the local `.docx`, calls `uploadFile(templateStorageKey(id), bytes, DOCX_CONTENT_TYPE)` (Phase 2 helper) to push to R2 under `templates/system/{id}/source.docx`.
- Idempotent (overwrites on re-run). Uses the same `R2_*` env + `src/lib/storage.ts` wrapper the app uses.
- Run manually once per environment: `npx tsx backend/scripts/seed-templates.ts`.
- Log each key written + byte count; exit non-zero on any failure.

**Why a script, not a migration:** R2 blobs aren't part of the SQL schema; seeding is an operational step like uploading any asset.

### Phase 1 — Backend template registry (constant)

**New file:** `backend/src/lib/builtinTemplates.ts`
- Export `BUILTIN_TEMPLATES: BuiltinTemplate[]` where:
  ```ts
  export interface BuiltinTemplate {
    id: string;          // stable slug, e.g. "nda"
    title: string;       // verbatim doc name, e.g. "NDA"
    description: string; // short line for the picker card
    category: string;    // grouping label for the picker, e.g. "Employment"
    fileType: "docx";    // v1 all docx
  }
  ```
- **v1: exactly ONE entry** — `{ id: "employment-agreement", title: "Employment Agreement", description: "<short line>", category: "Employment", fileType: "docx" }`. Category grouping is moot with a single template but keep the field so the picker renders correctly as the catalog grows. (Future groups when the other 5 land: Confidentiality, Employment, Commercial — cosmetic, confirm later.)
- Export a helper `getBuiltinTemplate(id): BuiltinTemplate | undefined`.
- This is the single source of truth consumed by: seed script (Phase 0), the endpoint (Phase 3), and — via a thin GET route — the frontend picker (Phase 4/5).

### Phase 2 — Storage key helper

**Edit:** `backend/src/lib/storage.ts`
- Add:
  ```ts
  export function templateStorageKey(templateId: string): string {
    return `templates/system/${templateId}/source.docx`;
  }
  ```
- Mirrors the existing `storageKey`/`generatedDocKey` helpers. No other change to this file.

### Phase 3 — Backend: list + instantiate endpoints

**Edit:** `backend/src/routes/documents.ts` (mounted at `/single-documents`)

**3a. `GET /single-documents/templates`** (requireAuth)
- Returns `BUILTIN_TEMPLATES` (id, title, description, category, fileType). No R2 access — pure constant. Feeds the picker.

**3b. `POST /single-documents/from-template`** (requireAuth)
- Body: `{ template_id: string, project_id?: string | null, folder_id?: string | null }`.
- Logic (near-copy of `handleDocumentUpload`, byte source swapped):
  1. Validate `template_id` against `getBuiltinTemplate`; 400 if unknown.
  2. If `project_id` provided: verify the caller has access to that project (reuse the same access check `handleDocumentUpload`/project routes use). If absent: standalone doc (`project_id: null`) — the §2.8 landing spot.
  3. `bytes = await downloadFile(templateStorageKey(template_id))`; 500 if missing (means seed wasn't run).
  4. Insert `documents` row: `{ project_id: project_id ?? null, user_id, status: "processing", folder_id: folder_id ?? null }`.
  5. `key = storageKey(userId, docId, filename)` where `filename = "{title}.docx"`. `uploadFile(key, bytes, DOCX_CONTENT_TYPE)`.
  6. DOCX→PDF rendition via `docxToPdf` → `convertedPdfKey(userId, docId)` (identical to upload path; wrap in try/catch, non-fatal).
  7. Insert `document_versions` V1 row: `source: "upload"`, `version_number: 1`, `filename`, `file_type: "docx"`, `size_bytes`, `page_count: null`, `storage_path: key`, `pdf_storage_path`.
  8. Update `documents` → `current_version_id`, `status: "ready"`.
  9. Return the created document (same response shape as `handleDocumentUpload`, so the frontend treats it exactly like a freshly uploaded doc).
- **Rate limiting:** reuse the existing upload limiter (`uploadLimiter`) applied to this route in `src/index.ts` — instantiation is an upload-equivalent write.
- **Refactor note (optional, keep small):** the doc+version+PDF creation in `handleDocumentUpload` could be extracted into a shared helper `createDocumentFromBytes(...)` reused by both upload and from-template to avoid drift. Recommended but optional; if it risks scope creep, copy the ~40 lines instead. Decide at review.

**No migration.** `source: "upload"` reuses the existing CHECK constraint.

### Phase 4 — Frontend API client

**Edit:** `frontend/src/app/lib/mikeApi.ts`
- Add types + two functions (mirroring `uploadStandaloneDocument`):
  ```ts
  export interface DocumentTemplate {
    id: string; title: string; description: string; category: string; fileType: string;
  }
  export async function listDocumentTemplates(): Promise<DocumentTemplate[]> {
    return apiRequest<DocumentTemplate[]>("/single-documents/templates");
  }
  export async function createDocumentFromTemplate(
    templateId: string,
    opts?: { projectId?: string | null; folderId?: string | null },
  ): Promise<Document> {
    return apiRequest<Document>("/single-documents/from-template", {
      method: "POST",
      body: JSON.stringify({
        template_id: templateId,
        project_id: opts?.projectId ?? null,
        folder_id: opts?.folderId ?? null,
      }),
    });
  }
  ```
- Uses the existing `apiRequest` helper (attaches bearer token, throws `MikeApiError`).

### Phase 5 — Frontend: dedicated TemplatePickerModal

**New file:** `frontend/src/app/components/shared/TemplatePickerModal.tsx`
- Reuse the visual shell of the existing pickers: `Modal` (`components/shared/Modal`), a search `input`, and a card/grid layout matching `AddDocumentsModal`/`FileDirectory` look. Keep it deliberately simpler than `AddDocumentsModal` (no upload, no delete, no directory tree).
- Props:
  ```ts
  interface Props {
    open: boolean;
    onClose: () => void;
    onInstantiated: (doc: Document) => void; // hand the new doc back to the chat
    projectId?: string | null;               // pass-through to the endpoint
    folderId?: string | null;
  }
  ```
- Behavior:
  1. On open, `listDocumentTemplates()` → group by `category` for display; support text search over title/description.
  2. Single-select. On click of a template card: set a per-card loading state, call `createDocumentFromTemplate(id, { projectId, folderId })`.
  3. On success: `onInstantiated(newDoc)` then `onClose()`.
  4. On error: inline error (reuse `AlertCircle` pattern from `AddDocumentsModal`).
- Loading/empty states: skeleton while fetching; "No templates available" if the list is empty (e.g. seed not run).

### Phase 6 — Frontend: "Use template" dropdown item

**Edit:** `frontend/src/app/components/assistant/AddDocButton.tsx`
- Add a new prop `onUseTemplate: () => void`.
- Insert a `DropdownMenuItem` **between** "Upload files" and "Browse all":
  ```tsx
  <DropdownMenuItem className="cursor-pointer" onClick={onUseTemplate}>
    <FileTextIcon className="h-4 w-4 mr-2 text-gray-500" />
    <span className="text-sm">Use template</span>
  </DropdownMenuItem>
  ```
  (Icon: `FileText` or `FilePlus` from lucide-react — pick at review.)
- Widen the dropdown if needed (`w-44` currently fine for "Use template").

### Phase 7 — Frontend: wire the modal into the chat

**Edit:** `frontend/src/app/components/assistant/ChatInput.tsx`
- Add state: `const [templatePickerOpen, setTemplatePickerOpen] = useState(false);`
- Pass `onUseTemplate={() => setTemplatePickerOpen(true)}` to `<AddDocButton />` (alongside existing `onSelectDoc`/`onBrowseAll`).
- Render `<TemplatePickerModal open={templatePickerOpen} onClose={...} projectId={<current project or null>} onInstantiated={handleAddDocFromProject} />`.
  - Reuse the SAME callback that "Upload files"/`onSelectDoc` already uses to attach a doc to the chat (`handleAddDocFromProject`), since the instantiated template is just a normal document. This is what makes the doc immediately available as chat context so the user can type requirements and `edit_document` runs on it.
  - `projectId`: pass the active project id when the chat is inside a project; pass `null`/undefined in the global assistant → backend creates a standalone doc (§2.8).
- **Check other `AddDocButton` mount points.** Grep shows `AddDocButton` is used in `ChatInput.tsx`; verify there are no other usages (e.g. tabular/workflow surfaces) that would now require the new `onUseTemplate` prop. If a mount point shouldn't offer templates, make `onUseTemplate` optional and only render the item when provided.

### Phase 8 — Verify (the gate before push)

Per CLAUDE.md, prod is the only environment and there is no test suite — the typecheck/build is the gate.
- Backend: `npm run build --prefix backend` (tsc must be clean).
- Frontend: `npm run build --prefix frontend` and `npm run lint --prefix frontend`.
- Manual smoke (local dev, backend :3001, frontend :4000, `FRONTEND_URL=http://localhost:4000`):
  1. Run `seed-templates.ts`; confirm the 1 key (`templates/system/employment-agreement/source.docx`) is in R2.
  2. `GET /single-documents/templates` returns 1 entry.
  3. In the global assistant chat: Documents → Use template → pick Employment Agreement → doc appears attached; open it (DOCX renders, PDF rendition present); confirm it's a standalone doc.
  4. In a project chat: same flow with `project_id`; doc lands in the project (and folder if selected).
  5. Type a requirement ("make the term 2 years, counterparty Acme") → confirm `edit_document` operates on the instantiated doc.
  6. Confirm the original `templates/system/...` blob is untouched (instantiation copies, never mutates).

---

## 6. File change summary

**New files**
- `backend/src/lib/builtinTemplates.ts` — registry constant + helper.
- `backend/scripts/seed-templates.ts` — one-shot R2 seed.
- `frontend/src/app/components/shared/TemplatePickerModal.tsx` — the picker.
- (assets) `backend/templates-src/*.docx` — seed input (gitignored unless intended to commit).

**Edited files**
- `backend/src/lib/storage.ts` — add `templateStorageKey`.
- `backend/src/routes/documents.ts` — add `GET /templates` + `POST /from-template`.
- `backend/src/index.ts` — apply the existing upload rate limiter to `/from-template` (verify mounting; the router is already mounted, so this may just be limiter placement).
- `frontend/src/app/lib/mikeApi.ts` — `listDocumentTemplates` + `createDocumentFromTemplate` + types.
- `frontend/src/app/components/assistant/AddDocButton.tsx` — new dropdown item + prop.
- `frontend/src/app/components/assistant/ChatInput.tsx` — state + modal wiring.

**No schema migration. No provider changes. No changes to existing endpoints' behavior.**

## 7. Edge cases & decisions baked in

- **Template blob missing at instantiate time** (seed not run): endpoint returns 500 with a clear message; picker shows inline error. Operationally, seeding is a deploy step.
- **DOCX→PDF conversion failure:** non-fatal (matches upload path) — doc still created, PDF rendition simply absent; display falls back to DOCX handling.
- **Copy semantics:** every instantiation is a fresh, fully-owned user document under `documents/{userId}/...`. The system template is read-only and shared; users never edit the master.
- **Access control:** instantiation into a project reuses the project access check; standalone docs are owned by the caller. No new RLS surface — the new doc rows are plain user-owned documents.
- **Verbatim naming collisions:** two "NDA" docs in one project are allowed (same as uploading the same file twice); user renames as needed.

## 8. Open items to confirm at review

1. **RESOLVED for v1** — the Employment Agreement `.docx` is supplied and staged. The other 5 templates are deferred; supply them later to expand the bank.
2. **Category grouping labels** — moot for v1 (single template). Revisit when the catalog grows.
3. **Dropdown icon** for "Use template" (`FileText` vs `FilePlus`).
4. **Refactor vs copy** for the shared doc-creation logic in Phase 3 (extract `createDocumentFromBytes` helper vs. copy ~40 lines). Lean: small copy for v1 to keep the PR tight; extract later if a third caller appears.
5. **Commit the `.docx` seed files to git or keep them out** (R2 is source of truth either way). The staged `employment-agreement.docx` is currently NOT in `.gitignore` — decide before the PR.

## 9. Explicitly out of scope (v1)

- Chat tools `list_templates` / `create_from_template` (conversational "start me an NDA" with no clicks) — **Phase 2 / future**.
- `hidden_templates` per-user declutter list.
- Per-account custom template libraries + admin curation UI (that is Option B).
- The `'template'` `source` enum value / analytics.
- Assistant auto-suggesting templates.

## 10. Rollback

Fully additive, so rollback = revert the PR. The seeded R2 blobs under `templates/system/` are inert if the code is reverted (nothing reads them). No data migration to undo.
