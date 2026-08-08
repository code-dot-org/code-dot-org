# Model fallback for aichat: design map

Status: draft for review. Assembled by reading code-dot-org at `bfb0dbe92` and
ai-gateway at `d651094`, not from the roadmap. Level counts were measured over
`dashboard/config/levels` and will drift as curriculum changes.

This document lists what has to be built, what has to be decided first, and what
breaks downstream. Recommendations are one engineer's reading of the code and are
meant to be argued with.

## 1. Current exposure

Two code paths serve aichat in production. `shouldUseAiGateway()`
(`apps/src/aichat/api/shouldUseAiGateway.ts`) picks between them per request: the
AI Gateway path is used when the model is Gemini *and* the `useAiGateway`
experiment is on, and always for `gemini-2.5-flash-image`, which has no Rails
support. Everything else goes through Rails.

The two paths moderate with different models:

| Path | Generation | Moderation | Fails when |
| --- | --- | --- | --- |
| Rails (`AichatRequestChatCompletionJob`) | Vertex `gemini-2.5-flash`, or OpenAI `gpt-4o-mini` when the level selects it | OpenAI `gpt-4o-mini-2024-07-18`, two calls per turn | Google **or** OpenAI is down |
| AI Gateway (browser to CF Worker) | Vertex `gemini-2.5-flash` | Vertex `gemini-2.5-flash`, plus Azure for images | Google is down |
| Image generation | Vertex `gemini-2.5-flash-image` | Azure image moderation, optional Gemini judge | Google is down; no substitute exists in our stack |
| Transcription | OpenAI `whisper-1` through the same Worker | n/a | OpenAI is down |

The premise that "aichat goes down if either OpenAI or Google goes down" is right
for the Rails path and wrong for the gateway path. On the gateway path moderation
is `gemini-2.5-flash` (`apps/src/aichat/api/client/helpers/safetyHelpers.ts`,
`DEFAULT_SAFETY_CONFIG`), not `gpt-4o-mini`. The migration already underway
therefore converts a two-provider dependency into a single-provider one: better
for the international-blocking problem only once a fallback exists, worse for
outage exposure until then.

### Where a fallback could live

- **A, in the Worker.** One implementation covers both moderation and generation,
  keeps the provider allowlist server-side, and lets policy change without an
  apps build.
- **B, in the browser client.** Can distinguish "model refused" from "provider
  unreachable", but puts routing policy in code a student's browser runs.
- **C, in the Rails helper.** Covers today's default traffic, but must be built
  twice — the legacy Vertex clients are still reachable through the
  `aichat_disable_vertex_ai` DCDO flag — and is discarded when the gateway
  migration finishes.

## 2. Five assumptions the code contradicts

### 2.1 The gateway is not Gemini-only

`ai-gateway/src/transcriptionHandler.ts` already builds an OpenAI provider with
`createOpenAI()` against the Cloudflare AI Gateway `/openai` route, using
`env.OPENAI_API_KEY`, and serves `whisper-1` in production. The credential, the
SDK package, the gateway route and the observability wrapper all exist.

What is missing is confined to `generateTextHandler.ts`, which hardcodes
`createVertex()`. Adding OpenAI there is provider selection plus keeping the
Priority-PayGo path Vertex-only. It is not a new integration.

### 2.2 The Worker routes by string-matching "gemini"

`generateTextHandler` accepts a requested model only if the string contains
`gemini`; otherwise it reads `modelId` off the object, and otherwise defaults to
`gemini-2.5-flash`. An OpenAI model id sent today is handed to Vertex as a Vertex
model name and fails at the provider. Fallback work must replace this with an
explicit model-to-provider table, which is the same table the allowlist needs.

### 2.3 The served model is already on the wire

`GatewayGenerateTextResponseV1Schema` carries `response.modelId`, populated by
`serializeGenerateTextV1`. Showing the truth in the UI after a fallback does not
require a schema version bump.

A V2 bump is needed only for a guaranteed-present field or an explicit
`fallbackUsed` flag, because `response` is optional. That is the documented
cross-repo submodule procedure in `ai-gateway/README.md` — a real cost, but not a
prerequisite.

### 2.4 Multi-model levels are dead, not merely rare

Across `dashboard/config/levels`, 2242 level files carry `availableModelIds`.
1884 name exactly one model that still exists in `modelDescriptions.json`; 358
name none. None name two or more.

42 files do list multiple ids, but every one of those lists is dominated by the
retired `gen-ai-*-mistral-*` fine-tunes, which `isValidDescription()` in
`apps/src/aichat/constants.ts` filters out at runtime because they are absent from
`AI_CHAT_MODEL_IDS`. The compare-models dialog and the student-facing picker have
no content to work with anywhere in the curriculum.

### 2.5 The honesty constraint is the model card, not the picker

The model picker is hidden on 2146 levels, read-only on 60, editable on 36. But
the presentation panel — which renders `Model Name: Gemini 2.5 Flash` along with
Overview and Training Data, from the same `selectedModelId` — is enabled on 968
levels.

"Do not fall back where the model is displayed" therefore excludes roughly 43% of
aichat levels, not a handful. That ratio is what makes the capability-category
question load-bearing rather than cosmetic.

## 3. The model-identity chain

`selectedModelId` is authored in levelbuilder, stored in the level's
`aichat_settings`, loaded into runtime `ModelParameters`, and then consumed by
four things at once:

1. The provider call. A fallback swaps this and nothing observable breaks.
2. The setup panel picker, visible on 96 levels. Becomes false after a swap.
3. The model card, reachable on 968 levels. Becomes false after a swap.
4. The stored `AichatRequest.model_customizations`, exported to analytics. Records
   intent rather than fact after a swap.

There are two ways out. Make the displayed value follow the served model — cheap
on the gateway path because `response.modelId` is already returned, impossible on
the Rails path because its clients discard the served model name. Or stop
displaying a specific model and let levels name a capability. The second is the
durable fix and removes the recurring "update every level when we change models"
tax, but it needs a schema change across 2242 level files and a curriculum
decision.

## 4. Moderation is not chat and should not share a policy

The failure modes are asymmetric. Chat that falls back to a worse model costs
quality, bounded. Moderation that falls back to a worse model costs a safety
incident, and an untested model is the wrong thing to introduce during an outage,
when volume is high and attention is elsewhere.

The Rails path already fails closed: if `AichatSafetyHelper` raises, the job marks
the request failed and no answer is shown. Fallback must not weaken that. The
question is not "fall back or fail" but "which models are approved to hold this
role" — and that has prerequisites:

- **The safety prompt is forked three ways.** It exists in `AichatSafetyHelper`
  (Ruby, with a Spanish-classroom variant keyed on script names), in
  `safetyHelpers.ts` (`DEFAULT_SAFETY_CONFIG`, English only), and in
  `ai_podcasts_safety_helper.rb`. The wordings have drifted. Approving a model for
  the moderation role means approving it against a specific prompt, so either the
  prompts are unified first or the approval is scoped to one fork and silently
  untrue for the others.
- **Structured output parity.** Moderation depends on a strict
  `OK | INAPPROPRIATE` enum via `Output.object`. OpenAI strict JSON schema mode
  has different requirements from Gemini's `responseJsonSchema`. A fallback target
  must be verified against the actual schema, not assumed compatible.
- **Temperature is scaled per provider.** `AichatAiHelper` multiplies the authored
  temperature by 1.5 for OpenAI and 2 for Gemini; the gateway path applies no
  scaling. A provider swap changes effective temperature unless the mapping
  travels with the fallback. For moderation, which depends on determinism, this is
  not cosmetic.

## 5. Decisions

**D1 — Where does fallback logic live?** Recommend the Worker: one implementation
covers filter and generation, the allowlist stays server-side, policy ships
without an apps build. Blocks D2, D3 and all of track A.

**D2 — Who owns the allowlist?** Today the client names the model and the Worker
accepts any string containing `gemini`. Recommend Rails putting the approved set
(or a policy id) in the JWT and the Worker enforcing it; the token already carries
client type, level, script, lesson and channel.

**D3 — What triggers a fallback?** Candidates: 5xx, 429 after the existing PayGo
retry, connect/read timeout, region block, manual kill switch. A content-filter
refusal is not a provider failure and must not trigger one. Recommend transport
and availability errors only, reusing the `generateWithPayGoFallback` shape. Open:
whether the kill switch is DCDO, Worker env, or both.

**D4 — Sticky per session or per call?** A mid-conversation swap changes the
assistant's voice and loses prompt-cache benefit. Recommend sticky for the rest of
the conversation, with the client remembering `response.modelId` and requesting it
explicitly. Feeds D5.

**D5 — Do we fall back for moderation?** Recommend yes, but only to a model that
has passed safety evaluation in the moderation role against the current prompt,
failing closed when no approved model is reachable. Needs safety sign-off and
prompt unification.

**D6 — Must the UI name the exact model?** The load-bearing question. If yes,
fallback is off for 968 levels unless the display follows the served model. If no,
capability categories remove the constraint and the recurring level-update tax.
Curriculum owns this. Blocks D7 and all of track B.

**D7 — How big is the capability-category change?** A new field alongside
`selectedModelId` with runtime resolution, or a replacement requiring migration of
2242 level files. Categories must cover what the code already gates on: text,
multimodal input, image output, structured output. Recommend adding the field,
resolving at request time, and migrating lazily — a 2242-file diff is reviewable
only when nothing else is changing at the same time.

**D8 — Retire `availableModelIds`?** Zero levels use it for its purpose. Recommend
removing the editor UI and compare dialog first, leaving the data in place, and
dropping it during the D7 migration, so the capability editor is designed against
a smaller surface.

**D9 — Who decides that Gemini is unavailable for a user?** Nothing in the
codebase keys off country for model selection today; this is greenfield. The
Worker gets country free from Cloudflare, Rails would need geocoding, the browser
cannot be trusted with it. Recommend deciding at the Worker for routing, and in
Rails only if the UI must also change. Open: default for unknown region and VPN
users.

**D10 — Does the Rails path get fallback too?** Rails is today's default, so
gateway-only fallback ships nothing until the `useAiGateway` experiment is on by
default; but building on Rails means building twice, against two client trees, for
code we intend to delete. Recommend gateway only, and treating the experiment
rollout as part of this project's critical path.

## 6. Two tracks

Most of the availability win needs no curriculum decision, because most aichat
traffic never displays a model name. AI Tutor resolves its model from a query
parameter defaulting to `gemini-2.5-flash` (`apps/src/lab2/ai/ai-tutor-model-id.ts`)
and never shows it. FlowLab, Music, the levelbuilder generators and Sprite Lab's
AI features are the same: none read `availableModelIds`, none render a model card,
none promise a student which model is answering.

**Track A, availability, no curriculum dependency.** OpenAI in the Worker, then
the allowlist in the JWT, then policy and telemetry. Milestone: fallback live for
AI Tutor, FlowLab, Music and the generators. This is where the outage risk mostly
sits, since AI Tutor runs inside coding levels rather than as an optional lab
activity.

**Track B, identity, blocked on D6.** Delete the dead multi-model feature, decide
name-versus-category, then capability categories across 2242 level files.
Milestone: fallback live on AI Chat Lab levels.

Shared prerequisites feeding both: safety approval with prompt unification,
served-model truth (read and record `response.modelId`), and the
model-to-provider table that replaces the "gemini" string match.

Run in parallel, the outage exposure closes months before the curriculum
conversation has to finish.

## 7. Blast radius

- **Analytics.** `AichatRequest.model_customizations` records the requested model
  and is wrong after a fallback. The table is `export_to_analytics` with every
  column `data_classification :restricted`, so adding a served-model field is a
  data-contract change, not just a migration.
- **Cost.** Gemini traffic runs on per-client donated Vertex service accounts
  (`ai_tutor` versus `ai_chat`); OpenAI has one shared student-learning key. A
  Google outage moves full production volume onto OpenAI billing with no
  per-client split, so attribution breaks exactly when spend spikes.
- **Rate limiting.** The Worker rate-limits per `user_id`. A failed attempt plus a
  fallback attempt is two calls per turn, three counting the existing PayGo retry.
  Fallback storms could trip `USER_RATE_LIMITER` and turn a partial outage into a
  total one.
- **CI.** UI tests stub moderation through `stub_aichat_external_services`, keyed
  on the literal word "Damn". A fallback path that bypasses
  `AichatSafetyHelper.find_toxicity` also bypasses the stub, making
  `dashboard/test/ui/features/star_labs/aichat` nondeterministic.
- **Observability.** `withProviderSpan` already carries a `tier` dimension for
  PayGo. Add fallback as a dimension in the same vocabulary rather than a new
  metric, so "how often did we fall back" is answerable alongside existing
  `GenAICurriculum` metrics.
- **Legacy Rails clients.** `aichat_disable_vertex_ai` still selects a parallel
  tree of `*_legacy` clients. Any Rails-side fallback is built twice unless that
  tree is retired first.
- **Image generation.** `gemini-2.5-flash-image` has no Rails path and no
  equivalent in our approved stack. Those 42 levels cannot be covered by any
  fallback; they need a graceful degradation message, not a substitute model.

## 8. Questions the code cannot answer

**Is naming the exact model part of the lesson?** The model card teaches students
to read a model's overview, training data and limitations. If the specific name
carries that lesson, fallback is permanently constrained on 968 levels. If the
name is incidental, capability categories remove the constraint and the recurring
cost of editing levels whenever we change models. Owner: curriculum. Blocks D6,
D7.

**Which countries, and from when, lose access to Gemini?** Region-based routing is
greenfield. The scope of the blocked set determines whether region routing is P0
alongside outage fallback, and whether a partial answer — block-list of known
regions, permissive default — is acceptable at launch. Owner: legal and product.
Blocks D9.

**Which models are approved to run moderation, and who signs off?** Without a
named approver and a target model, D5 cannot close and moderation fallback cannot
ship, which means chat fallback ships alone into a filter that still has a single
point of failure. Owner: safety. Blocks D5.

**Is the OpenAI spend covered for a full-traffic day?** Fallback converts a Google
outage from an availability incident into an unbudgeted OpenAI bill at full
production volume with no per-client attribution. Worth knowing the ceiling before
fallback is enabled rather than during the first incident. Owner: finance and
engineering leadership. Informs the D3 kill switch.
