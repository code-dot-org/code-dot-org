# 07 — Teacher: student says "it won't let me in"

**Verdict: PARTLY**

## Path taken
- CodeAI Documentation (home) — start
- Search "invalid section code" — 0 results (dead end)
- Search "student can't sign in" — 30 results, clicked top match
- Managing your roster (anchored to "Reset a student's password or secret") — 2 clicks from home

## Answering sentence
"If a student forgets how to sign in: On the Roster tab, select Edit next to the student. For email sections, enter a new password. For picture or word sections, CodeAI generates a new secret. Select Save."

## Confusion points
- Searching "invalid section code" (the literal on-screen error) returned "No results." The exact wording a teacher would type gets nothing.
- Docs say "select Edit next to the student" — the live Roster page has no Edit button. Real controls are an "Actions" menu (only "View parent letter" / "Remove student") and a "Show picture" button that reveals "Reset."
- Docs fix is scoped to "forgets how to sign in" (bad secret/password) but the symptom was an invalid section code, entered before the student ever reaches their name/secret. Docs never address "invalid section code" as its own failure mode.
- Product's own Login Info page says "Manage Students tab" and "Show picture" — but the sidebar says "Roster," not "Manage Students." Docs and in-product copy disagree with each other and with the real UI.

## Screenshots
No screenshots on the Managing your roster page. A screenshot of the actual roster row controls would have caught the Edit-vs-Actions/Show-picture mismatch.

## Product test
Partially succeeded via a different path than the docs described. Found "Show picture" under the Picture password column, which reveals "Reset" + "Hide picture." Clicked Reset — student's picture password changed. The docs' "Edit" button does not exist.

## Three wishes
1. "Tell me what to click by its real name — 'Show picture,' then 'Reset' — not 'Edit,' which doesn't exist."
2. "Add a line for 'student says the section code is invalid' — a typo in the 6-letter code, not a forgotten secret."
3. "Show a screenshot of the Roster row so I can see where to click while 26 kids wait."
