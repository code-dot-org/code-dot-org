# ai-features domain plan

## Blocking questions

1. The classrooms-and-progress page `evaluate-with-a-rubric.md` links to `/teachers/ai/evaluation/`. That path is this domain's to write. Confirm the canonical path or patch the link. Decision below: write at `/teachers/ai/evaluation/` and note it in the report.
2. Chatter is an ActionCable demo with no AI. Resolution: one line in the developer page, no user page.
3. `AichatRequestsController` has no `authenticate_user!`. Resolution: stated plainly in the developer page.

## Reachability classification

| Feature | Class | Evidence |
|---|---|---|
| AI Chat lab (`lab-aichat`) | Available to specific classrooms | Section `ai_chat_access_level` (default `disabled`), auto-enabled when course has AI chat levels; `aichat_access_units` DCDO (default `[]`) adds more. `ai-gateway-enabled` default `true`. STRONGLY SUPPORTED. |
| AI Lab (`lab-ailab`) | Generally available | No flag or experiment gate. Level type `Ailab` is rendered for anyone. STRONGLY SUPPORTED. |
| AI rubric evaluation (`rubric-ai-evaluation`) | Generally available (teacher opt-out) | `Policies::Ai.ai_rubrics_enabled?` requires `verified_teacher?` and `!ai_rubrics_disabled`. No experiment or DCDO gate. STRONGLY SUPPORTED. |
| AI rubric feedback loop (`rubric-ai-feedback-loop`) | Generally available | POST endpoints have no experiment gate. STRONGLY SUPPORTED. |
| AI Tutor (`ai-tutor`) | Dark (experiment `lesson-tutor`, DCDO `ai-teaching-assistant-launch` default false) | DCDO default false; experiment must be enabled in DB or localStorage. No default-on path. STRONGLY SUPPORTED. |
| AI differentiation chat (`ai-differentiation-chat`) | Dark (experiment `ai-differentiation` + DCDO `ai-diff-drawer` default false) | Both gated. Ability.rb requires `Experiment.enabled?('ai-differentiation') && user.teacher?`. STRONGLY SUPPORTED. |
| AI differentiation artifacts (`ai-differentiation-artifacts`) | Dark (nested inside `ai-differentiation` + `ai-artifact` experiments) | STRONGLY SUPPORTED. |
| AI exit tickets (`ai-exit-tickets`) | Dark (experiment `ai-differentiation` via ability.rb) | STRONGLY SUPPORTED. |
| AI lesson hooks (`ai-lesson-hooks`) | Dark (experiment `ai-differentiation` via ability.rb) | STRONGLY SUPPORTED. |
| AI lesson summaries (`ai-lesson-summaries`) | Dark (DCDO `show-aita-lesson-summaries` default false, `ai-lesson-summaries-notifications-enabled` default false) | STRONGLY SUPPORTED. |
| AI lesson summary podcast (`ai-lesson-summary-podcast`) | Dark (DCDO `ai-lesson-summary-podcasts` default false; 403 when off) | STRONGLY SUPPORTED. |
| AI student podcast (`ai-student-podcast`) | Dark (experiment `lesson-tutor` gates controller) | STRONGLY SUPPORTED. |
| AI student snapshot (`ai-student-snapshot`) | Dark (DCDO `student-snapshot-feedback-link` default false; `cfu-pin-hide-enabled` default false) | STRONGLY SUPPORTED (frontend checks). |
| Chatter (`ai-chatter`) | Not AI; leftover ActionCable demo | STRONGLY SUPPORTED. |
| Practice problems / challenges (`ai-practice-problems`) | Generally available | ability.rb grants `:create`/`:index`/`:show` to any signed-in user (outside experiment gates). STRONGLY SUPPORTED. |
| AI gateway (`ai-gateway`) | Generally available (infra) | DCDO `ai-gateway-enabled` default `true`. Developer only. STRONGLY SUPPORTED. |
| AI safety pipeline (`ai-safety-pipeline`) | Generally available (infra) | Runs on every AI request. Developer only. STRONGLY SUPPORTED. |
| AI prompt management (`ai-prompt-management`) | Dark (experiment `use-langfuse-prompt`) | STRONGLY SUPPORTED. Developer only. |
| AI observability (`ai-observability`) | Generally available when AI features are used | DCDO `log_aichat_usage` default false, but Langfuse tracing runs. Developer only. STRONGLY SUPPORTED. |
| AI model registry (`ai-model-registry`) | Generally available | No flag. Developer only. STRONGLY SUPPORTED. |
| AI teaching profile (`ai-teaching-profile`) | Ambiguous | No flag found; DCDO `openai_temperature_scaling_factor` tunes it. May be dead code. AMBIGUOUS. |
| AI section access level (`ai-section-access-level`) | Generally available | Teacher dashboard section settings. STRONGLY SUPPORTED. |

## What gets user pages

Generally available features reachable by real users in production:
- AI Chat lab (gated per-section, but teacher controls it; document both sides)
- AI Lab (no gate)
- AI rubric evaluation (verified teachers only; document the teacher task)
- AI rubric feedback loop (part of the rubric evaluation flow)
- Practice problems / challenges (generally available)
- AI section access level (teacher setting)

Dark features: no user pages. Documented in evidence only.

## Pages

### Teachers

| Path | Type | Question it answers | Inventory ids | Journey |
|---|---|---|---|---|
| `teachers/ai/evaluation/` (`review-ai-evaluation.md`) | task | "AI suggested scores for my rubric. How do I review them?" | rubric-ai-evaluation, rubric-ai-feedback-loop | BLOCKED (requires rubric level with student work) |
| `teachers/ai/control-ai-for-your-class.md` | task | "My class has AI Chat. What do I control?" | ai-section-access-level, lab-aichat | Screenshot: section settings AI tab |
| `teachers/ai/about-ai-in-codeai.md` | concept | "What does the AI know, what does it not do, and what about student data?" | ai-safety-pipeline (user-facing framing) | None |

### Students

| Path | Type | Question it answers | Inventory ids | Journey |
|---|---|---|---|---|
| `students/learning/use-ai-chat.md` | task | "My lesson has AI Chat. What can I ask it?" | lab-aichat | BLOCKED (requires Aichat level, no AI provider locally) |
| `students/learning/train-an-ai-model.md` | task | "My lesson asks me to train a model. How?" | lab-ailab, ai-model-registry | BLOCKED (requires Ailab level) |
| `students/learning/practice-with-challenges.md` | task | "How do I use practice problems and challenges?" | ai-practice-problems | BLOCKED (requires seeded data) |

### Developers

| Path | Type | Question it answers | Inventory ids | Journey |
|---|---|---|---|---|
| `developers/ai/ai-subsystem.md` | concept | "How does the AI subsystem work end to end?" | ai-gateway, ai-safety-pipeline, ai-prompt-management, ai-observability, ai-model-registry, ai-chatter, ai-teaching-profile | None |

## Screenshots

- Section settings AI tab (for `control-ai-for-your-class.md`): teacher dashboard section settings page. Plausible crop of the AI access level dropdown.
- AI evaluation panel: BLOCKED (requires rubric level with student submission + AI provider).

## Terminology observed

- UI says "class" in teacher dashboard sections list; says "section" in the URL and API.
- UI says "AI Assessment" on the rubric panel button (per Cucumber feature).
- Section settings AI tab: need to verify label in browser.

## Items left undocumented (with reason)

- `ai-tutor`, `ai-differentiation-chat`, `ai-differentiation-artifacts`, `ai-exit-tickets`, `ai-lesson-hooks`, `ai-lesson-summaries`, `ai-lesson-summary-podcast`, `ai-student-podcast`, `ai-student-snapshot`: all dark (DCDO default false or experiment-gated, no default-on path). Recorded in evidence.
- `ai-prompt-management`: dark (experiment `use-langfuse-prompt`). Mentioned in developer page concept section.
- `ai-teaching-profile`: AMBIGUOUS availability. Mentioned in developer page.
- `ai-chatter`: not AI. One line in developer page.
