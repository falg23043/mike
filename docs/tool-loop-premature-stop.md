# Tool loop premature stop — debugging notes

Status: **intermittent, not fully resolved.** Last observed 2026-07-31. Keep
this file updated with each new occurrence.

## Symptom
Mike does a chunk of preparatory tool work (read_document, find_in_document,
etc.) on an edit task, then **ends its turn before actually performing the
edit** — the requested changes never get applied. The user sees either a blank
tail or a plausible-looking wrap-up, but no `doc_edited` result.

## Relevant code
- `backend/src/lib/chatTools.ts`
  - `SYSTEM_PROMPT` "TOOL BUDGET" block (~line 111): tells the model how many
    tool-use rounds it has.
  - `maxIterations` at the `streamChatWithTools` call site (~line 4071).
  - `streamStoppedEarly` notice (~line 4240): the "reached step limit" message.
- `backend/src/lib/llm/bedrock.ts`
  - `MAX_TOOL_ROUNDS` constant (single source of truth for the cap).
  - The tool loop and its natural-finish branch:
    `if (stopReason !== "tool_use" || !toolCalls.length || !runTools) { ... }`.
  - The cap-hit wrap-up (`stoppedEarly`) that forces a text answer with
    `tool_choice: { type: "none" }`.

## Known failure modes (three distinct ones)

1. **Cap-hit, blank answer** — loop exhausts `maxIter` mid-tool-use; historically
   surfaced as "task done but blank response." **Fixed** (PR #5): a forced
   wrap-up call with tools disabled makes the model produce closing text, plus a
   visible "reached step limit" notice.

2. **Prompt/loop budget mismatch + empty end_turn** — the real cap was raised to
   20 but the prompt still said "at most 10 … reserve room … don't gather on the
   final round." A thorough run (~11 calls) blew past the stated 10 and bailed
   the instant it got its last lookup, ending with `stop_reason=end_turn` and an
   **empty** final message. The natural-finish branch treated any non-tool-use
   stop as "done" with no text-presence check, so no wrap-up fired.
   **Addressed** (commit 8a038e8, 2026-07-31):
   - `MAX_TOOL_ROUNDS = 20` constant used by the prompt, the call site, and the
     `streamBedrock` default — so the number the model is told can't drift from
     the enforced cap again.
   - Rewrote the TOOL BUDGET block to say 20 and bias toward completing the edit
     instead of reserving room / not gathering on the final round.
   - **Empty-final-turn guard:** if the loop would finish naturally but the final
     turn produced no closing text after ≥1 tool round, inject ONE continuation
     nudge ("finish the remaining edits, then summarize") with tools STILL
     enabled (distinct from the cap-hit wrap-up, which disables tools). Bounded
     by `MAX_EMPTY_FINISH_NUDGES = 1`.

3. **Narrate-the-plan-then-stop** (observed 2026-07-31, AFTER commit 8a038e8) —
   model does read-only prep (~4 rounds, far under the cap), then emits a
   **non-empty** plan as its final text (e.g. "I'll make the changes:
   (1)…(2)…(3)…(4)…") and ends the turn without calling any edit tool.
   - Fix #2's empty-final guard does NOT catch this: `turnText` is non-empty, so
     the loop treats the plan as a legitimate completion.
   - Budget is not the trigger (well under the cap).
   - **Not yet fixed.** On a later retry the same request worked, so it is
     intermittent (model-behavior variance, not a hard code path).

## Latent bug to fix regardless
The natural-finish branch triggers on ANY `stopReason !== "tool_use"`, which
INCLUDES `max_tokens`. A turn cut off mid-work by the 16k cap would be treated
as "completed" (truncated text, no continuation). Handle `max_tokens`
distinctly from `end_turn`.

## Candidate fixes for mode 3 (not yet implemented)
1. **Prompt rule (lowest risk):** never end a turn by only *describing* edits you
   haven't made; if you say you'll edit, call the edit tool in the same response
   and only finish once the edits are applied. Consider pushing planning into the
   thinking channel rather than final text.
2. **Structural guard (not text heuristics):** track whether any
   document-mutating tool (edit/create/replace) ran this response. If the loop
   would finish naturally, the request was an edit task, and zero mutating tools
   ran → inject one continuation nudge (tools enabled), same shape as the
   empty-final guard. Hard part: detecting "edit was expected" without
   false-positiving on legitimate research/Q&A that ends with "next steps."
3. Handle `max_tokens` distinctly (see above).

## Evidence gaps / do this first next time
- **Confirm the deployed commit SHA.** The tested app is the remote Nixpacks
  deploy (Railway/Render-style, `backend/nixpacks.toml`), which rebuilds on push.
  Before trusting any before/after comparison, verify the running build actually
  includes the fix — a stale build looks identical to "the fix didn't work."
- **No finish-decision logging exists.** We don't log `stopReason`, final-turn
  text presence, or tool counts at the natural-finish branch. Adding that would
  turn future diagnosis from guesswork into evidence. High-value, cheap.
- **No regression test reproduces the real transcript.** Build a harness that
  replays "read-only prep → plan-and-stop" and asserts the edit actually happens
  before claiming mode 3 is fixed.

## Occurrence log
- 2026-07-31 ~09:37 EDT — B Capital First Amendment signature-block edit.
  Mode 3 (narrate-then-stop). Retry shortly after **succeeded**. Monitoring.
