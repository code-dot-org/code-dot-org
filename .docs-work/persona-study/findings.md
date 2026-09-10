# Persona study findings

14 scenarios, 4 audiences, blind Sonnet participants navigating the rendered
docs site and the local product.

## Verdict tally

| Audience | HELPED | PARTLY | FAILED |
|---|---|---|---|
| Students (01-05) | 3 | 2 | 0 |
| Teachers (06-09) | 1 | 3 | 0 |
| District administrators (10-11) | 1 | 1 | 0 |
| Developers (12-14) | 2 | 1 | 0 |
| **Total** | **7** | **7** | **0** |

Navigation worked: every participant found a relevant page within 1-3 clicks.
The IA succeeds at getting people to the right neighborhood. What failed was
the content once they arrived: missing screenshots, label mismatches with the
product, unanswered sub-questions, and buried limitations.

---

## Ranked findings

### F1. Almost no screenshots (hurt 12 of 14 participants)

Evidence: Participants 01, 02, 03, 06, 07, 08, 09, 10, 11, 12, 13, 14
all noted zero or insufficient images on the pages they needed. Only
participant 04 found a useful screenshot (share dialog).

Pages concerned: Nearly every page across all audiences.

Proposed change: Add targeted control-crop screenshots to every task page
where the docs name a UI element the reader must locate: the section-code
input box (join-a-section), the login-type picker with its real labels
(choose-a-login-type), the Roster row showing Show picture / Reset
(managing-your-roster), the progress grid with icon states
(tracking-progress), the rubric panel with AI evaluation
(review-ai-evaluation), the share dialog (already has one, but fix the
blank box), the password-reset form (reset-your-password), the approval
email sender/subject (approve-a-teacher-application), the Drone Restart
button (testing). Each crop at the step that names the control.

### F2. Button and label mismatches between docs and product (hurt 6 of 14)

Evidence:
- P06: docs say "Picture" / product says "Picture password"; docs say
  "Create a section" / product says "+ New class section"
- P07: docs say "Edit" next to student / product has "Show picture" then
  "Reset"; docs reference "Manage Students tab" / product sidebar says "Roster"
- P01: docs say "Select Join section" / product button says "Join"
- P09: three different button names across two pages for the same AI
  assessment action

Pages concerned: choose-a-login-type, create-a-section,
managing-your-roster, join-a-section, review-ai-evaluation,
giving-feedback-and-grading.

Proposed change: Audit every bold UI label on every page against the live
product. Use the exact string the product shows. Where the product uses a
different string than the docs, update the docs. Run this as a journey test
that asserts the label text.

### F3. Docs defer the answer to a different page (hurt 5 of 14)

Evidence:
- P04: "Can I share this?" never answers "can someone without an account
  see it" -- that answer is on Sharing and publishing, one click away.
- P10: Canvas deep-linking limitation is on "What LMS integration provides,"
  not on the registration page where the admin does the work.
- P09: which courses have AI evaluation is never stated on any page.
- P05: what data is collected is deferred to the email link, never stated.
- P08: "Icon Key" refers to a product UI element, not a docs explanation.

Pages concerned: can-i-share-this, connect-your-lms,
review-ai-evaluation, about-ai-in-codeai, permission-request,
tracking-progress.

Proposed change: For each: place the critical fact on the page where the
reader lands with the question, not on a downstream page.

### F4. Search fails on the reader's natural terms (hurt 3 of 14)

Evidence:
- P07: "invalid section code" -- 0 results.
- P14: "flake" -- 2 false-positive substring matches. "Drone rerun" -- 0 results.

Proposed change: Add a keyword/alias mechanism to pages (frontmatter
keywords field). Key terms to index: "invalid section code," "can't sign
in," "won't let me in," "flake," "flaky test," "rerun," "restart build."

### F5. No troubleshooting for common failure modes (hurt 4 of 14)

Evidence:
- P07: "invalid section code" not addressed as a symptom anywhere.
- P02: no guidance for what to do if the password-reset page errors.
- P14: no flake-vs-real-break decision guide.
- P08: no mention that course catalog is grade-filtered.

Proposed change: Add short "If this does not work" subsections to task pages.

### F6. CodeAI/Code.org naming confusion (hurt 2 of 14)

Evidence:
- P01 (9-year-old): "formerly" is too advanced a word.
- P05 (parent): name change unexplained in context.

Proposed change: Plain-language explanation: "CodeAI is the new name for
Code.org. Your teacher may still call it Code.org."

### F7. Missing prerequisites and assumed state (hurt 4 of 14)

Evidence:
- P10: LMS registration page does not say a CodeAI account is required.
- P06: docs assume a teacher account; persona had a student account.
- P02: no mention of what to do if already signed in as someone else.
- P09: "AI features enabled" with no link to check status.

Proposed change: Every task page that requires a specific account state
should say so in a Prerequisites line and link to the remedy.

### F8. Pages read as capability inventories, not help (hurt 3 of 14)

Evidence:
- P05: parent permission page says "limits data collection" without listing
  what is collected.
- P09: AI pages list features without saying which courses have them.
- P14: testing page names suites but does not help diagnose a red build.

Proposed change: Rewrite openings to lead with the reader's question and
answer it directly.

---

## Product-versus-docs mismatches

| # | Docs say | Product shows | Page | Participants |
|---|---|---|---|---|
| M1 | "Select Edit next to the student" | No Edit button; "Show picture" reveals "Reset" | managing-your-roster | P07 |
| M2 | "Choose Picture" | Button reads "Picture password -- Recommended for ages 4-8" | choose-a-login-type | P06 |
| M3 | "Select Create a section" | Button reads "+ New class section" | create-a-section | P06 |
| M4 | "Select Join section" | Button reads "Join" | join-a-section | P01 |
| M5 | "Manage Students tab" (in-product copy) | Sidebar says "Roster" | in-product Login Info page | P07 |
| M6 | Three different button names for AI assessment across two pages | Unknown (could not reach) | review-ai-evaluation + giving-feedback-and-grading | P09 |
| M7 | Password reset at /users/password/new | HTTP 500 Recaptcha::RecaptchaError | Product (local dev) | P02 |

## What gold standard would look like here

The navigation works. Participants found the right page in 1-3 clicks every
time. What the pages need to become gold standard:

1. Show, do not just tell. Every task page that names a UI control should
   include a tight crop of that control, placed at the step that names it.

2. Answer the question the reader came with, on the page they land on.
   Deferring the critical fact to a second page fails the reader who will
   not click through.

3. Use the product's own words. Every bold label in the docs should be
   the exact string the product displays.

4. Name what can go wrong. Task pages need a short "If this does not work"
   section for the failures a reader will actually hit.

5. Help the reader decide, not just do. Where the reader must choose,
   frame the choice in the reader's terms and recommend.
