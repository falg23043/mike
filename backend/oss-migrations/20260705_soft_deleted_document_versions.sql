-- Soft-delete tombstones for document_versions.
-- Deleted versions stay in the table for history/audit but their file bytes
-- are removed and they are ignored by every active-file lookup.

alter table public.document_versions
  alter column storage_path drop not null;

alter table public.document_versions
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

create index if not exists document_versions_active_document_id_idx
  on public.document_versions(document_id, created_at desc)
  where deleted_at is null;
