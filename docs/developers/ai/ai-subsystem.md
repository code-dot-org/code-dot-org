---
title: AI subsystem
description: Architecture, safety pipeline, provider clients, authorization, flags, and observability for AI features.
type: concept
---

The AI subsystem powers AI Chat, AI evaluation, AI Lab, and the teacher-facing AI tools.

## Request path

AI-powered features follow one of two paths from the browser to a language model:

1. **Rails backend.** The browser POSTs to a Rails controller (e.g., `AichatRequestsController`, `EvaluateRubricJob`). The controller calls a provider client helper, which makes an HTTP request to OpenAI, Vertex AI (Gemini), or Amazon Bedrock. The response returns through the same path.

2. **AI Gateway.** For Gemini traffic in AI Chat, the browser obtains a short-lived JWT from `POST /ai_gateway/access_token` (`AiGatewayAuthController`), then sends requests directly to a Cloudflare Worker that proxies to the model. The DCDO flag `ai-gateway-enabled` (default `true`) is the platform-wide kill switch; the experiment `useAiGateway` gates individual users on the frontend.

Most features use path 1. Path 2 exists to reduce latency and backend load for the highest-volume feature (AI Chat with Gemini).

## Provider clients

| Client | Location | Models | Used by |
|---|---|---|---|
| `AichatAiClient` subclasses | `dashboard/app/helpers/aichat_ai_client.rb` | OpenAI, Gemini (via Rails) | AI Chat (legacy path) |
| `AichatOpenaiResponsesHelper` | `dashboard/app/helpers/aichat_openai_responses_helper.rb` | OpenAI Responses API | AI Chat (OpenAI path) |
| `AiEvaluationOpenaiHelper` | `dashboard/app/helpers/ai_evaluation_openai_helper.rb` | OpenAI | Rubric AI evaluation |
| `AiLessonSummariesHelper` | `dashboard/app/helpers/ai_lesson_summaries_helper.rb` | OpenAI | Lesson summaries |
| `PersonalizationOpenaiHelper` | `dashboard/app/helpers/personalization_openai_helper.rb` | OpenAI | Teaching profile personalization |
| `AiStudentSnapshotHelper` | `dashboard/app/helpers/ai_student_snapshot_helper.rb` | OpenAI | Student snapshots |
| `AiDiffBedrockHelper` | `dashboard/app/helpers/ai_diff_bedrock_helper.rb` | Amazon Bedrock (Claude) | AI differentiation, exit tickets, lesson hooks |

All clients read `openai_http_open_timeout` (default 5s) and `openai_http_read_timeout` (default 30s) from DCDO. Two helpers override the read timeout with feature-specific keys: `aichat_safety_openai_read_timeout` and `ai-podcasts_safety_openai_read_timeout`, each falling back to `openai_http_read_timeout` with a 20s default.

## Authorization

### Policies::Ai

`dashboard/lib/policies/ai.rb` contains the policy predicates:

- `ai_rubrics_enabled?(user)` — requires `verified_teacher?` and `!user.ai_rubrics_disabled`.
- `ai_rubrics_enabled_for_script_level?(user, script_level)` — true when any of the student's sections for that unit has a teacher with AI rubrics enabled.
- `ai_differentiation_enabled?(user)` — requires `user.teacher?` and `!user.ai_differentiation_toggled_off?`.
- `ai_differentiation_enabled_for_unit?(unit_or_unit_group)` — checks `unit.stable?`.

### AichatRequestsController auth

`AichatRequestsController` has no `authenticate_user!` call, and `ApplicationController` does not set a default authentication before-action. Authorization is via `authorize_resource class: false` (CanCan). A `CanCan::AccessDenied` is rescued at the controller level and renders a 403 with `user_type: current_user&.user_type || 'signed_out'`. The actual gate for anonymous users is the CanCan ability check, not an authentication filter.

### Section-level AI Chat access

Each section has an `ai_chat_access_level` column (default `disabled`). Values: `enabled`, `disabled`, `essential_only`. When a teacher assigns a course that has AI Chat levels (`Unit#has_ai_chat_tools?`), `AichatAccessHelper.compute_ai_chat_access_level` auto-enables access. The `aichat_access_units` DCDO key (default `[]`) lets levelbuilders dynamically add units.

## Safety pipeline

Every AI request that touches user-provided text passes through a safety pipeline:

1. **PII detection.** Amazon Comprehend scans input for personally identifiable information. Stubbed in development and test environments.
2. **Profanity check.** WebPurify checks for blocked language. Gated by Gatekeeper `webpurify`. Rate-limited per user by `profanity_request_limit_per_min_*`.
3. **Model response.** The provider generates a response.
4. **Output screening.** The response is checked before it reaches the user. For AI Chat image generation, an additional LLM-as-judge image safety check runs (gated by `aichat-output-image-llm-safety-judge-enabled`, default `true`; Azure moderation runs regardless).

Safety helpers: `AichatSafetyHelper` (AI Chat), `AiPodcastsSafetyHelper` (podcasts), `ProfanityController` (`POST /profanity/find`).

For rubric evaluation, PII or profanity in student code results in a `PII_VIOLATION` or `PROFANITY_VIOLATION` status instead of a score.

## Flag family

All AI features are gated. The table below covers the user-facing flags; internal tuning keys (`openai_http_*`, polling intervals) are omitted.

| Key | Type | Default | What it gates |
|---|---|---|---|
| `ai-gateway-enabled` | DCDO | `true` | Platform-wide AI Gateway kill switch |
| `ai-gateway-turnstile-enforcement-mode` | DCDO | `disabled` | Cloudflare Turnstile CAPTCHA on gateway tokens |
| `ai-teaching-assistant-launch` | DCDO | `false` | Marketing banners for the AI teaching assistant |
| `ai-diff-drawer` | DCDO | `false` | AI differentiation drawer workspace |
| `ai-lesson-summaries-notifications-enabled` | DCDO | `false` | Lesson summary notifications (job + in-app) |
| `show-aita-lesson-summaries` | DCDO | `false` | Lesson summaries in teacher dashboard |
| `ai-lesson-summary-podcasts` | DCDO | `false` | Lesson summary podcasts (403 when off) |
| `aichat-output-image-llm-safety-judge-enabled` | DCDO | `true` | LLM image safety judge |
| `aichat_access_units` | DCDO | `[]` | Additional units with AI Chat access |
| `ai-differentiation` | Experiment | DB/cookie/localStorage | AI differentiation FAB and abilities |
| `ai-artifact` | Experiment | DB/cookie/localStorage | AI artifact generation (nested inside `ai-differentiation`) |
| `ai-diff-levels` | Experiment | DB/cookie/localStorage | AI diff FAB on individual level pages |
| `ta-teacher-panel` | Experiment | DB/cookie/localStorage | Teacher Panel inside the AI drawer |
| `lesson-tutor` | Experiment | DB/cookie/localStorage | AI Tutor+ review page and student podcasts controller |
| `lesson-tutor-challenge` | Experiment | DB/cookie/localStorage | Challenge modality in AI Tutor+ |
| `useAiGateway` | Experiment | DB/cookie/localStorage | Routes Gemini traffic through the gateway |
| `use-langfuse-prompt` | Experiment | DB/cookie/localStorage | Sources AI Tutor prompts from Langfuse |

Experiments are enabled through: (1) rows in the `experiments` table matching the user by id range, section, or script; (2) a `_experiments` cookie set at sign-in from the user's enabled experiments; (3) browser `localStorage` via `?enableExperiments=` URL params; (4) the DCDO flag of the same name (lowest priority). Frontend checks run in `apps/src/util/experiments.js`; backend checks run via `Experiment.enabled?(user:, experiment_name:)`.

## Prompt management

System prompts live in two places:

- **Rails helpers** under `dashboard/app/helpers/ai_system_prompts/`: `evaluate_system_prompt_helper.rb`, `lesson_summaries_system_prompt_helper.rb`, `student_podcast_prompt_helper.rb`, `student_snapshot_prompt_helper.rb`, `system_prompt_helper.rb`.
- **Langfuse** (external, experiment-gated). When the `use-langfuse-prompt` experiment is on, AI Tutor fetches prompts from Langfuse via `LangfuseHelper` / `LangfuseClientHelper` (`dashboard/app/helpers/langfuse_helper.rb`). This decouples prompt iteration from deploys.

AI differentiation prompts (exit tickets, lesson hooks, chat) are defined in `AidiffPromptHelper` (`dashboard/app/helpers/aidiff_prompt_helper.rb`), which calls Amazon Bedrock via `AiDiffBedrockHelper`.

## Observability

- **Langfuse tracing.** `LangfuseHelper.trace_lesson_insight`, `trace_lesson_feedback`, and dataset-item capture send traces to Langfuse for the TA project.
- **Honeybadger.** `aichat_verbose_honeybadger_reporting` (DCDO, default `false`) enables detailed error reporting for AI Chat.
- **CDO.log.** `log_aichat_usage` (DCDO, default `false`) logs AI Chat usage via `AichatAiUsageReporter`.
- **AI rubric metrics.** `AiRubricMetrics` (concern in `dashboard/app/jobs/concerns/ai_rubric_metrics.rb`) records evaluation job outcomes.
- **AI observability controller.** `POST /ai_observability/add_internal_ai_tutor_dataset_item` captures tutor interactions for the internal dataset.

## Chatter

`GET /chatter/index` is an unauthenticated ActionCable chat demo introduced in PR #67871. It has no AI provider call, no webpack entry point, and no tests. The WebSocket channel (`ChatterChannel`) requires a signed-in Warden session, but the HTTP page renders for anyone. It is not an AI feature.

## Related

- `dashboard/lib/policies/ai.rb` — policy predicates
- `apps/src/aichat/` — AI Chat frontend
- `apps/src/aiTutor/` — AI Tutor frontend
- `apps/src/aiDifferentiation/` — AI differentiation frontend
- `apps/src/util/experiments.js` — experiment mechanism
