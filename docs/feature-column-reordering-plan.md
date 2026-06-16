# Feature Plan: Drag-and-Drop Column / Item Reordering

**Date:** 2026-06-15
**Author:** Giskard (with Guillaume)
**Status:** Approved — building on main (all 3 surfaces)

## Guillaume's answers (2026-06-15)
1. Build all three surfaces.
2. The read-only accordion in DisplayWorkflowModal stays read-only. The **workflow detail page** (`workflows/[id]/page.tsx`, reached via the "Edit" button — Column Title / Format / Prompt table) is the editable one → add DnD here.
3. Excel export follows new on-screen order: yes.
4. Commit to main (no feature branch).

## Goal
Let users reorder columns (and column-building items) by click-and-drag, instead of
deleting and recreating columns to change their position.

---

## Key architectural finding (the crux)

Columns are stored as a `columns_config` JSON array. **Each column carries an `index`
field that is overloaded with TWO different jobs:**

1. **Data identity** — generated cells are keyed by `column_index` (see
   `tabular.ts` cell inserts, `TabularReviewView.tsx` cell lookups, `TRTable.tsx`
   `c.column_index === col.index`). This is how a cell's value is tied to its column.
2. **Display order** — `TRTable.tsx` line 72 does
   `const sortedColumns = [...columns].sort((a, b) => a.index - b.index)`, and
   `DisplayWorkflowModal.tsx` line 200 sorts the same way.

**Implication:** If we reorder by mutating `index`, every existing cell becomes
mis-mapped (the supplier column's results would suddenly display under "customer").
We must **decouple display order from data identity.**

### Decision: introduce display order = array position; keep `index` as the stable key

- `column.index` stays **immutable** for the life of a column = the permanent data key.
  New columns keep getting `max(index) + 1` (logic already in `nextColumnIndex`).
- **Display order becomes the array order of `columns_config`** (position 0 = leftmost).
- Remove the `.sort((a,b) => a.index - b.index)` calls so the array order drives
  rendering. Reordering = reordering the array; cell mapping via `column_index`
  stays correct because indexes never change.

This is the smallest, safest change and needs **no DB migration** (it's all JSON).

---

## Where reordering applies (3 surfaces)

### 1. Tabular Review (live table) — HIGHEST VALUE
- File: `frontend/src/app/components/tabular/TRTable.tsx` (header row) +
  `TabularReviewView.tsx` (state + persistence via `saveColumnsConfig`).
- Drag column headers left/right to reorder. On drop → reorder `columns` array →
  `saveColumnsConfig(reordered)` (PATCH `columns_config`, optimistic with rollback —
  pattern already present at lines 440-461).
- Cells stay correct because they're keyed on `column_index` (unchanged).

### 2. Workflow creator / column list (AddColumnModal)
- File: `frontend/src/app/components/tabular/AddColumnModal.tsx`.
- The multi-column draft builder (`columns: ColumnDraft[]`, `addAnotherColumn`,
  `removeColumn`). Add drag handles to reorder drafts before they're committed.
  Pure local state reorder — trivial.

### 3. Workflow detail / editor page (workflows/[id]/page.tsx)
- File: `frontend/src/app/(pages)/workflows/[id]/page.tsx` (the Column Title / Format /
  Prompt table, opened by "Edit").
- This page **reindexes columns on every mutation** (`.map((c,i)=>({...c,index:i}))`)
  and has NO persisted cells tied to index (cells only exist in tabular *reviews*).
  → Reindexing on reorder is SAFE here. After arrayMove, reindex sequentially and
  `saveColumns(next)` (PATCH workflow `columns_config`).
- The read-only `DisplayWorkflowModal` accordion stays as-is (no DnD).

---

## Library choice

No DnD library currently in `frontend/package.json`. Recommend **`@dnd-kit/core` +
`@dnd-kit/sortable`** (modern, accessible, keyboard support, small, React 19 / Next 16
compatible, actively maintained). Alternative: native HTML5 drag events (zero deps but
clunky, poor touch support). Going with dnd-kit.

```
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Implementation steps

1. **Add dnd-kit deps** to frontend.
2. **Decouple order from index ONLY for live reviews** (cells keyed by column_index):
   - `TRTable.tsx` line 72 — render in array order (drop the index-sort).
   - In a live review, DO NOT reindex on reorder — keep each column's `index` stable;
     just reorder the array and persist. Cells stay glued via `column_index`.
   - Workflow editor page (#3): reindexing IS fine (no cells) — keep its existing
     sequential reindex pattern after arrayMove.
3. **Build a reusable `SortableColumnHeader` / `useColumnReorder`** wrapper so the
   three surfaces share drag logic.
4. **Surface 1 (TRTable):** wrap header cells in `SortableContext`; on `onDragEnd`
   compute `arrayMove`, update `columns` state, call `saveColumnsConfig` with
   optimistic rollback.
5. **Surface 2 (AddColumnModal):** wrap draft rows in `SortableContext`; reorder local
   `columns` draft state. Add a drag handle (grip icon) per row.
6. **Surface 3 (DisplayWorkflowModal):** if editable, same pattern → PATCH workflow.
7. **Backend:** likely **no change** — `columns_config` is persisted as-is. Verify the
   tabular PATCH path (`tabular.ts` ~line 537) preserves array order and doesn't
   re-sort by index. Add a guard test if needed.
8. **Visual affordance:** grip handle (lucide `GripVertical`), cursor-grab, drop
   indicator line, dragging opacity. Keep consistent across all three surfaces.
9. **Export check:** `exportToExcel.ts` should follow array order so the exported
   sheet matches on-screen order. Verify/adjust.
10. **Test:** reorder in a review with existing generated cells → confirm values stay
    glued to their columns; reload → order persisted; export → matches.

---

## Risks / edge cases
- **Cell remapping bug** (the big one) — mitigated by keeping `index` immutable.
- **Concurrent edits** to a shared review — optimistic update + rollback already used.
- **Header drag vs. column resize/click-to-edit** — gate drag behind a dedicated grip
  handle so existing header click actions (edit/menu) still work.
- **Touch / accessibility** — dnd-kit gives keyboard + pointer sensors for free.

## Out of scope (unless requested)
- Reordering rows (documents).
- Reordering assistant-type workflow content (no columns there).
