# ai-features domain report

## Reachability classification

| Feature | Class | Grade |
|---|---|---|
| AI Chat lab | Available to specific classrooms (section access level) | STRONGLY SUPPORTED |
| AI Lab | Generally available | STRONGLY SUPPORTED |
| AI rubric evaluation | Generally available (verified teacher, opt-out) | STRONGLY SUPPORTED |
| AI rubric feedback loop | Generally available (part of rubric eval) | STRONGLY SUPPORTED |
| Practice problems / challenges | Generally available | STRONGLY SUPPORTED |
| Section AI access level | Generally available (teacher setting) | STRONGLY SUPPORTED |
| AI Tutor | Dark (experiment lesson-tutor, DCDO default false) | STRONGLY SUPPORTED |
| AI differentiation chat | Dark (experiment + DCDO) | STRONGLY SUPPORTED |
| AI differentiation artifacts | Dark (nested experiments) | STRONGLY SUPPORTED |
| AI exit tickets | Dark (experiment) | STRONGLY SUPPORTED |
| AI lesson hooks | Dark (experiment) | STRONGLY SUPPORTED |
| AI lesson summaries | Dark (DCDO default false) | STRONGLY SUPPORTED |
| AI lesson summary podcast | Dark (DCDO default false, 403) | STRONGLY SUPPORTED |
| AI student podcast | Dark (experiment lesson-tutor) | STRONGLY SUPPORTED |
| AI student snapshot | Dark (DCDO default false) | STRONGLY SUPPORTED |
| AI teaching profile | AMBIGUOUS (no flag found) | AMBIGUOUS |
| Chatter | Not AI; ActionCable demo | STRONGLY SUPPORTED |
| AI gateway | Generally available infra (default true) | STRONGLY SUPPORTED |
| AI safety pipeline | Generally available infra | STRONGLY SUPPORTED |
| AI prompt management | Dark (experiment) | STRONGLY SUPPORTED |
| AI observability | Available when AI features used | STRONGLY SUPPORTED |
| AI model registry | Generally available | STRONGLY SUPPORTED |

## Pages written

| Path | Type | Grade | Journey |
|---|---|---|---|
| teachers/ai/review-ai-evaluation.md | task | STRONGLY SUPPORTED | BLOCKED (rubric level + provider) |
| teachers/ai/control-ai-for-your-class.md | task | STRONGLY SUPPORTED | BLOCKED (AI-Chat course) |
| teachers/ai/about-ai-in-codeai.md | concept | STRONGLY SUPPORTED | None |
| students/learning/use-ai-chat.md | task | STRONGLY SUPPORTED | BLOCKED (Aichat level + provider) |
| students/learning/train-an-ai-model.md | task | STRONGLY SUPPORTED | BLOCKED (Ailab level) |
| students/learning/practice-with-challenges.md | task | STRONGLY SUPPORTED | BLOCKED (seeded data) |
| developers/ai/ai-subsystem.md | concept | STRONGLY SUPPORTED | None |

## Screenshots

None. All plausible crops require either AI provider credentials or specific curriculum data not seeded locally. Recorded as BLOCKED in evidence.

## UI labels observed

- Button: "Run AI Assessment for Project", "Run AI Assessment for Class"
- Panel heading: "AI Assessment"
- Feedback prompt: "Is AI accurate?"
- Score labels: "Extensive or Convincing Evidence", "Limited or No Evidence"
- Teacher nav tab: "AI Settings"
- Section heading: "Class Section Settings"
- Toggle: "AI Chat Tools"
- Checkbox: "Allow essential AI features only"
- Account toggle: "Use AI features" / "Use AI Features on CodeAI"

## Canonical path for AI evaluation

Written at /teachers/ai/review-ai-evaluation/. The existing link in evaluate-with-a-rubric.md patched from /teachers/ai/evaluation/ to /teachers/ai/review-ai-evaluation/.

## Questions for Fable

1. ai-teaching-profile: no flag, may be dead code. Left out of user pages.
2. Practice problems and challenges may be two generations of the same concept.
3. student-snapshot-feedback-link has conflicting defaults (false in Ruby, undefined in JS).

## Undocumented items

13 dark features omitted from user pages per availability convention. Cataloged in developer page and plan. ai-teaching-profile omitted (AMBIGUOUS). ai-chatter described as one line in developer page (not AI).

## Build and evidence

- npm run build: passed (127 pages)
- npm run evidence:check: passed
- Journeys: all BLOCKED, documented in ai-features.spec.ts
