# Model fallback for aichat: design map

Status: draft for review, rev 2. Assembled by reading code-dot-org at `bfb0dbe92`
and ai-gateway at `d651094`, not from the roadmap. Revised after reading PR #73926
(`147af9b`), which lands the region block and, as built, forecloses the fallback
it anticipates. Level counts were measured over `dashboard/config/levels` and will
drift as curriculum changes.

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
| Transcription | OpenAI `whisper-1` through the same Worker | n/a | OpenAI is down, **or** the user cannot mint a gateway token |

The premise that "aichat goes down if either OpenAI or Google goes down" is right
for the Rails path and wrong for the gateway path. On the gateway path moderation
is `gemini-2.5-flash` (`apps/src/aichat/api/client/helpers/safetyHelpers.ts`,
`DEFAULT_SAFETY_CONFIG`), not `gpt-4o-mini`. The migration already underway
therefore converts a two-provider dependency into a single-provider one, which is
worse for outage exposure until a fallback exists.

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

## 2. The region block in flight, and the door it closes

PR #73926 answers most of the geography question. `User#gemini_models_blocked?`
resolves location from `school_info.country` when present, else the most recent
`user_geos` entry, and fails open: a user we cannot place is never blocked. A
teacher is international when they are non-US; a student when all their teachers
are. Levelbuilders are exempt, and the `allow_international_aichat_usage` DCDO
flag lifts the whole thing without a deploy.

Enforcement differs by path, deliberately, because the two paths know different
things. `aichat_requests_controller` checks the request's own `selectedModelId`,
which is exact. The gateway path cannot: the JWT carries no model claim, so a
token minted after checking a client-supplied model id could be replayed against a
blocked one. So `ai_gateway_auth_controller` refuses to mint a token at all.

### A blocked user holds no gateway token, so there is nothing for a fallback to answer

Withholding the token is the right call today. As the PR says, it "costs blocked
users nothing they were still allowed to do", because the gateway only serves
Gemini. The moment fallback exists that stops being true: the gateway becomes the
thing that *can* serve those users, and they are the one group that cannot reach
it.

Fallback for international users therefore requires replacing token-refusal with a
model-scoped token — the `AllowModelFallback` / `GeminiBlocked` claims the PR
already anticipates in its review notes. This is not an optimization to add later.
It is the first commit of the fallback project, and it is what turns decision D2
from a recommendation into a prerequisite.

The same change fixes the latent speech-to-text bug the PR documents.
Transcription is OpenAI `whisper-1` and has no regional restriction, but it mints
gateway tokens, so blocked users lose the mic. Nothing regresses today only
because the mic renders on Gemini levels or behind the `enable-speech-to-text`
experiment; widen that experiment and the bug surfaces.

### What #73926 also settles or delivers

- `AI_CHAT_GEMINI_MODEL_IDS` now exists as the single source of truth for which
  models Google serves, and `modelHelpers` builds its provider map from it. That is
  most of the model-to-provider table the fallback work needs. The Worker still has
  its own string match to replace.
- AI Tutor is fully blocked internationally, since it defaults to
  `gemini-2.5-flash` and never varies by level. Fallback is not a resilience
  nicety for AI Tutor; it is the only route back to service for those users.
- Music lab's internal `askAi` 403s for blocked users, accepted as an internal
  tool. Worth revisiting once fallback exists, because the fix becomes free.
- Non-Gemini levels keep working on the Rails path, so international users retain
  `gpt-4o-mini` and mistral levels today. Any fallback must not regress that by
  routing them somewhere they cannot go.

## 3. Moderation is the gate, not a parallel policy

`generateChatResponse()` calls `isTextSafe(text, 'input_filter')` before it calls
the model, and that filter is `gemini-2.5-flash`. So when Gemini is unavailable —
outage or region block — the turn fails at the input filter and generation is never
attempted. Chat fallback without moderation fallback buys nothing on the gateway
path. Any plan that sequences "chat fallback now, moderation fallback later" ships
zero user-visible improvement.

### The fallback moderator is the incumbent, not a new model

`gpt-4o-mini` moderates every request on the Rails path in production today. The
Gemini-based moderator is the newer, less-established one, introduced with the
gateway path. So moderation fallback means falling back to the model that already
holds the role, not qualifying a novel one.

That shrinks the safety question from "evaluate and approve a new moderator" to
"confirm the existing approval covers the gateway's prompt variant", which lands
on the forked-prompt problem below and makes prompt unification the actual
critical-path task.

### The risk asymmetry still argues for different policies

Chat that falls back to a worse model costs quality, bounded. Moderation that falls
back to a worse model costs a safety incident. The Rails path already fails closed:
if `AichatSafetyHelper` raises, the job marks the request failed and no answer is
shown. Fallback must not weaken that. What changed is that "do we do it at all" is
settled by the call ordering; only "to what, and how do we prove it" is open.

### The safety prompt is forked three ways

The moderation system prompt exists in `AichatSafetyHelper` (Ruby, with a
Spanish-classroom variant keyed on script names), in `safetyHelpers.ts`
(`DEFAULT_SAFETY_CONFIG`, English only), and in `ai_podcasts_safety_helper.rb`. The
wordings have drifted. Approving a model for the filter role means approving it
against a specific prompt, so either the prompts get unified first or the approval
is scoped to one fork and silently untrue for the others.

### Two mechanical prerequisites

- **Structured output parity.** Moderation depends on a strict
  `OK | INAPPROPRIATE` enum via `Output.object`. OpenAI strict JSON schema mode has
  different requirements from Gemini's `responseJsonSchema`. Verify against the
  actual schema rather than assuming compatibility.
- **Temperature is scaled per provider.** `AichatAiHelper` multiplies the authored
  temperature by 1.5 for OpenAI and 2 for Gemini; the gateway path applies no
  scaling. A provider swap changes effective temperature unless the mapping travels
  with the fallback. For a filter that depends on determinism, this is not
  cosmetic.

## 4. Five assumptions the code contradicts

### 4.1 The gateway is not Gemini-only

`ai-gateway/src/transcriptionHandler.ts` already builds an OpenAI provider with
`createOpenAI()` against the Cloudflare AI Gateway `/openai` route, using
`env.OPENAI_API_KEY`, and serves `whisper-1` in production. The credential, the SDK
package, the gateway route and the observability wrapper all exist.

What is missing is confined to `generateTextHandler.ts`, which hardcodes
`createVertex()`. Adding OpenAI there is provider selection plus keeping the
Priority-PayGo path Vertex-only. It is not a new integration.

### 4.2 The Worker routes by string-matching "gemini"

`generateTextHandler` accepts a requested model only if the string contains
`gemini`; otherwise it reads `modelId` off the object, and otherwise defaults to
`gemini-2.5-flash`. An OpenAI model id sent today is handed to Vertex as a Vertex
model name and fails at the provider.

Replacing it with an explicit model-to-provider table is the same work as
enforcing the token's allowed set, and `AI_CHAT_GEMINI_MODEL_IDS` (added by
#73926) is already the client-side half of that table.

### 4.3 The served model is already on the wire

`GatewayGenerateTextResponseV1Schema` carries `response.modelId`, populated by
`serializeGenerateTextV1`. Showing the truth in the UI after a fallback does not
require a schema version bump.

A V2 bump is needed only for a guaranteed-present field or an explicit
`fallbackUsed` flag, because `response` is optional. That is the documented
cross-repo submodule procedure in `ai-gateway/README.md` — a real cost, but not a
prerequisite.

### 4.4 Multi-model levels are dead, not merely rare

Across `dashboard/config/levels`, 2242 level files carry `availableModelIds`.
1884 name exactly one model that still exists in `modelDescriptions.json`; 358
name none. None name two or more.

42 files do list multiple ids, but every one of those lists is dominated by the
retired `gen-ai-*-mistral-*` fine-tunes, which `isValidDescription()` in
`apps/src/aichat/constants.ts` filters out at runtime because they are absent from
`AI_CHAT_MODEL_IDS`. The compare-models dialog and the student-facing picker have
no content to work with anywhere in the curriculum.

### 4.5 The honesty constraint is the model card, not the picker

The model picker is hidden on 2146 levels, read-only on 60, editable on 36. But
the presentation panel — which renders `Model Name: Gemini 2.5 Flash` along with
Overview and Training Data, from the same `selectedModelId` — is enabled on 968
levels.

"Do not fall back where the model is displayed" would therefore exclude roughly
43% of aichat levels, not a handful. That ratio is what makes the
capability-category question load-bearing rather than cosmetic.

## 5. The model-identity chain

`selectedModelId` is authored in levelbuilder, stored in the level's
`aichat_settings`, loaded into runtime `ModelParameters`, and then consumed by four
things at once:

1. The provider call. A fallback swaps this and nothing observable breaks.
2. The setup panel picker, visible on 96 levels. Becomes false after a swap.
3. The model card, reachable on 968 levels. Becomes false after a swap.
4. The stored `AichatRequest.model_customizations`, exported to analytics. Records
   intent rather than fact after a swap.

Since #73926 it is also an access-control input: `can_use_aichat_model?` reads it,
so any capability indirection has to keep the region gate exact.

There are two ways out. Make the displayed value follow the served model — cheap
on the gateway path because `response.modelId` is already returned, impossible on
the Rails path because its clients discard the served model name. Or stop
displaying a specific model and let levels name a capability. The second is the
durable fix and removes the recurring "update every level when we change models"
tax, but it needs a schema change across 2242 level files and a curriculum
decision.

## 6. Decisions

**D1 — Where does fallback logic live?** Recommend the Worker: one implementation
covers filter and generation, the allowlist stays server-side, policy ships
without an apps build. Blocks D2, D3 and all of track A.

**D2 — Model-scoped tokens.** Promoted from recommendation to prerequisite by
section 2. Today the Worker accepts any string containing `gemini`, and #73926
works around that by refusing blocked users a token entirely, which also denies
them the fallback. Recommend Rails putting the allowed model set plus a blocked
flag in the JWT and the Worker enforcing it. Replaces refusal, closes the replay
hole, restores transcription. Blocks any international fallback at all.

**D3 — What triggers a fallback?** Candidates: 5xx, 429 after the existing PayGo
retry, connect/read timeout, region block, manual kill switch. A content-filter
refusal is not a provider failure and must not trigger one. Recommend transport
and availability errors plus the region flag, reusing the
`generateWithPayGoFallback` shape. Open: whether the kill switch is DCDO, Worker
env, or both.

**D4 — Sticky per session or per call?** A mid-conversation swap changes the
assistant's voice and loses prompt-cache benefit. Recommend sticky for the rest of
the conversation, with the client remembering `response.modelId` and requesting it
explicitly. Region-triggered fallback is sticky by construction.

**D5 — Moderation fallback target.** No longer "whether": section 3 shows the
input filter runs first, so gateway fallback is impossible without it. Recommend
falling back to `gpt-4o-mini`, which already moderates all Rails traffic, and
confirming the existing approval covers the gateway prompt variant; fail closed
when no approved model is reachable. Needs safety sign-off and prompt unification.

**D6 — Must the UI name the exact model?** The load-bearing curriculum question.
If yes, fallback is off for 968 levels unless the display follows the served
model. If no, capability categories remove the constraint and the recurring
level-update tax. Curriculum owns this. Blocks D7 and all of track B.

**D7 — How big is the capability-category change?** A new field alongside
`selectedModelId` with runtime resolution, or a replacement requiring migration of
2242 level files. Categories must cover what the code already gates on: text,
multimodal input, image output, structured output — and must not blur the region
gate. Recommend adding the field, resolving at request time, and migrating lazily.

**D8 — Retire `availableModelIds`?** Zero levels use it for its purpose. Recommend
removing the editor UI and compare dialog first, leaving the data in place, and
dropping it during the D7 migration, so the capability editor is designed against
a smaller surface.

**D9 — Who decides that Gemini is unavailable for a user?** Settled by #73926,
and settled correctly in Rails rather than the Worker, because the decision needs
school records and teacher relationships the edge cannot see. What remains is that
the Worker needs the outcome in the token rather than the decision, which is D2.
Still open: whether "fails open" stays right once fallback means an unplaced user
gets Gemini rather than nothing.

**D10 — Does the Rails path get fallback too?** Rails is today's default, so
gateway-only fallback ships nothing until the `useAiGateway` experiment is on by
default; but building on Rails means building twice, against two client trees, for
code we intend to delete. Recommend gateway only, and treating the experiment
rollout as part of this project's critical path.

## 7. Two tracks

Most of the value needs no curriculum decision, because most aichat traffic never
displays a model name — and that traffic is exactly what the region block takes
offline. AI Tutor resolves its model from a query parameter defaulting to
`gemini-2.5-flash` (`apps/src/lab2/ai/ai-tutor-model-id.ts`) and never shows it.
FlowLab, Music, the levelbuilder generators and Sprite Lab's AI features are the
same: none read `availableModelIds`, none render a model card, none promise a
student which model is answering.

**Hard gate on both tracks:** moderation approval with prompt unification. The
Gemini input filter is the first call of every gateway turn, so nothing ships
without it. Served-model truth (read and record `response.modelId`) is the other
shared item.

**Track A, availability, no curriculum dependency.** Model-scoped tokens (D2),
then OpenAI in the Worker with the model-to-provider table, then policy and
telemetry. Milestone: fallback live for AI Tutor, FlowLab, Music and the
generators, and AI Tutor restored for international users.

**Track B, identity, blocked on D6.** Delete the dead multi-model feature, decide
name versus category, then capability categories across 2242 level files.
Milestone: fallback live on AI Chat Lab levels.

Run in parallel, the outage and region exposure close months before the curriculum
conversation has to finish.

## 8. Blast radius

- **Token minting.** `ai_gateway_auth_controller` currently refuses blocked users
  outright. It must become a model-scoped grant before any fallback reaches
  international users, and it silently governs transcription too.
- **Analytics.** `AichatRequest.model_customizations` records the requested model
  and is wrong after a fallback. The table is `export_to_analytics` with every
  column `data_classification :restricted`, so adding a served-model field is a
  data-contract change, not just a migration.
- **Cost.** Gemini traffic runs on per-client donated Vertex service accounts
  (`ai_tutor` versus `ai_chat`); OpenAI has one shared student-learning key. A
  Google outage moves full production volume onto OpenAI billing with no
  per-client split, so attribution breaks exactly when spend spikes. The region
  block makes some of that spend permanent rather than incidental.
- **Rate limiting.** The Worker rate-limits per `user_id`. A failed attempt plus a
  fallback attempt is two calls per turn, three counting the existing PayGo retry,
  on top of the three calls a turn already makes. Fallback storms could trip
  `USER_RATE_LIMITER` and turn a partial outage into a total one.
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
  fallback; they need a graceful degradation message, not a substitute model, and
  under #73926 they are already hard-blocked internationally.

## 9. Questions the code cannot answer

**Is naming the exact model part of the lesson?** The model card teaches students
to read a model's overview, training data and limitations. If the specific name
carries that lesson, fallback is permanently constrained on 968 levels. If the
name is incidental, capability categories remove the constraint and the recurring
cost of editing levels whenever we change models. Owner: curriculum. Blocks D6,
D7.

**Does the existing gpt-4o-mini moderation approval cover the gateway's prompt?**
The fallback moderator is the incumbent, but the prompt it was approved against is
one of three drifted copies and the gateway uses a different one. Narrow but
blocking: either the approval travels to the gateway's wording, or the wording
comes back to the approval. Until this closes, nothing on track A ships, because
the input filter is the first call of every gateway turn. Owner: safety. Blocks
D5, and therefore all of track A.

**Is the OpenAI spend covered, now that some of it is permanent?** Two different
bills. Outage fallback is a spike: full production volume on OpenAI for the
duration. Region fallback is a floor: every international user, every day, for as
long as the block stands, with no per-client key split to attribute it. Worth
sizing both before fallback is enabled rather than during the first incident.
Owner: finance and engineering leadership. Informs the D3 kill switch.

**Does "fails open" still mean the same thing after fallback?** #73926 never
blocks a user it cannot place, which is right when the alternative is denying
service. Once a fallback exists the choice changes shape: an unplaced user could
be served the substitute instead of Gemini, at some cost in quality and none in
access. Not urgent, but the current default was chosen under different constraints
and should be revisited deliberately rather than inherited. Owner: product and
legal. Refines D9.
