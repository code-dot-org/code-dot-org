# 13 — Engineer: ship a feature behind a flag

**Verdict: HELPED**

## Path taken
- CodeAI Documentation (home) — start
- Availability and configuration (Developers > Platform) — 1 click. Answered the question.

## Answering sentence
"The standard lifecycle for a new feature: Add a DCDO flag defaulting off. In your code, read DCDO.get('my-feature', false). Pick one default and use it at every call site. Create a Pilot record (if the feature needs opt-in users). Use the staff console at /admin/pilots... Flip the flag in DCDO. Go to /admin/dcdo, set the key to true."

## Confusion points
- "different call sites for the same key can disagree" — expected a single documented default per flag; instead warns the engineer to verify no one already used the key with a different default.
- Typo example ("lab2-fetch-level-proper0ties-by-lesson-id") is a colorful but distracting aside, not relevant to shipping a new flag.
- Lifecycle shows DCDO.get(...) code for the flag check but nothing like Pilot.enabled?(current_user, 'my-pilot') for the Pilot check. Expected a matching code snippet.
- Permission mismatch: DCDO/Gatekeeper consoles require authorize! :read, :reports, but Pilot console requires require_admin (admin? boolean) — a stricter, different permission, easy to miss.

## Screenshots
None. Pure text/code-block/table content. No image was critically missing; a diagram of "DCDO flag + Pilot record + join link" relationship might have helped but was not necessary.

## Product test
Navigated to /admin/dcdo — got HTTP 403 (CanCan::AccessDenied). Confirms the console exists at the documented path and is gated by authorization, as the docs described.

## Three wishes
1. "Show the exact CanCanCan check and which roles satisfy it."
2. "Show a Pilot/Experiment lookup code snippet next to the DCDO.get one."
3. "Give a worked example: one small PR diff showing the flag, Pilot, and check combined."
