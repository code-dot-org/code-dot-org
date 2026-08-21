# AI Tutor, as a package

The tutor is a chat panel that sits in a lab's resource panel, sees the
student's project, and answers about it. On studio it can also hand back a
**set of file edits** the student accepts or rejects — which is the part that
makes it agentic rather than a chatbot beside a code editor.

This package is that panel, extracted from `apps/` so a lab in
`frontend/packages/labs/*` can mount it, and so it can run with **no server at
all** — against recorded fixtures, or against a dev's own API key through a
local proxy.

Status: all six milestones are done (§10), the access rules are ported, and Web
Lab is the first lab wired to it (§11.1).

## 1. What exists today, and where

Three directories in the legacy bundle, layered, none of them a package:

| Layer             | Path                                             | Notes                                                               |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| Context + prompts | `apps/src/aiTutor/`                              | 82 files, 448K — but most of it is `views/lessonDeepDive/` (see §2) |
| Chat engine       | `apps/src/aichat/`                               | 588K: redux slice, thunks, transport, message model, workspace UI   |
| Lab binding       | `apps/src/lab2/views/components/AiTutorChat.tsx` | 177 lines; the thing a lab actually mounts                          |

The files that matter to this port, by line count:

```
apps/src/lab2/views/components/AiTutorChat.tsx              177   what a lab mounts
apps/src/aichat/views/ChatWorkspace.tsx                     465   the panel itself
apps/src/aichat/redux/slice.ts                              283   chat state
apps/src/aichat/redux/thunks/submitChatContents.ts          340   the send path
apps/src/aichat/types/chatEvents.ts                         162   the message model
apps/src/aichat/api/performClientApiChatCompletion.ts       125   gateway branch
apps/src/aichat/api/client/generateChatResponse.ts          227   model call + moderation
apps/src/aichat/api/shouldUseAiGateway.ts                    16   which branch
apps/src/aiTutor/helpers/aiTutorContextHelper.ts             97   hidden-context assembly
apps/src/aiTutor/suggestedPrompts.ts                         78   the buttons
apps/src/aiTutor/types.ts                                    23   AiTutorContext
apps/src/weblab2/helpers/aiTutorStructuredResponseHelper.ts  257   the agentic schema
apps/src/weblab2/hooks/useAiTutorResponseSchemaSettings.ts   110   accept/reject wiring
apps/src/aiComponentLibrary/aiTutorVersionActions/…tsx       263   the accept/reject UI
```

Prompt text lives as markdown beside the code —
`apps/src/aiTutor/prompts/answerTypeTriggers/*.md` (six) and
`answerTypeContracts/*.md` (three). Those are data, and port as data.

### The socket is already cut

`frontend/packages/labs/base/src/resourcePanel/components/ResourcePanel.tsx`
already has an `AiTutor` tab in its `Tabs` enum, and the block that would fill
it is commented out at lines 11–12, 192–229, 560 and 585–605, still naming
`@cdo/apps/lab2/views/components/AiTutorChat`. Whoever ported the resource
panel left the hole deliberately. **This package fills that hole**, and the
shape of its default export is therefore already constrained: it must satisfy
the call site those comments describe.

## 2. Scope

**In.** The resource-panel chat: message model, transport, send path, message
list, composer, suggested-prompt buttons, waiting state, error states, hidden
context assembly, structured (agentic) responses and the accept/reject
affordance.

**Out, for now.**

- `apps/src/aiTutor/views/lessonDeepDive/**` — some 60 of the 82 files. Skills
  checks, reflections, flashcards, podcasts, video challenges. A different
  product that happens to share a directory; `frontend/packages/lesson-deep-dive`
  already exists for it.
- `apps/src/aiTutor/views/legacyLabs/**` — the collapsed sidebar rail for
  applab/gamelab/weblab (`AI_TUTOR_LEGACY_LABS`). Those labs are not coming to
  `frontend/`; the resource panel is the only host here. `AiTutorContainer.tsx`
  is nonetheless worth reading before writing §5, because it is the clearest
  statement of what the tutor needs from a lab.
- Teacher-facing chat history (`fetchUserChatHistory`, `studentChatHistory`,
  profanity feedback). Server-shaped, and useless without a server. §12.
- Audio (`transcribeAudio`) and multimodal assets. §12.

## 2.1 One package, three things in it

The legacy names three layers and this package holds two of them, so it is
worth saying plainly which is which before anyone goes looking.

`ChatWorkspace` has exactly two consumers in the legacy bundle:
`aichatLab/views/AichatView.tsx` and `lab2/views/components/AiTutorChat.tsx`.
So:

| Legacy               | What it is                                            |
| -------------------- | ----------------------------------------------------- |
| `apps/src/aichat`    | shared chat plumbing — model, transport, workspace UI |
| `apps/src/aichatLab` | a LAB whose subject is a chat                         |
| `apps/src/aiTutor`   | a PANEL that lives inside other labs                  |

The tutor and the chat lab are different products. They share the plumbing and
nothing else: one is a resource-panel tab that reads the project a student is
working on, the other is a level type whose exercise is the conversation
itself.

**This package holds the plumbing and the tutor**, and the split within it is
by directory:

| Plumbing — a chat lab would want all of it                                         | The tutor's own                                                      |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `model/`, `transport/`, `dev/`, `session/`                                         | `context/`                                                           |
| `components/MessageView`, `Composer`, `WaitingAnimation`, `failureText`, `strings` | `prompts/`, `components/AiTutorPanel`, `components/SuggestedPrompts` |

Roughly 1700 lines against 400.

A separate `@code-dot-org/aichat` was considered and not done. It is the
tidier shape and it costs a package, an import graph and a release for a
boundary that has one consumer today. When `packages/labs/aichat` is built it
becomes the second, and the split is a move of whole directories — the seam is
already where it would be cut.

WHAT THIS COSTS, so nobody is surprised by it: the generic types are named for
the tutor. `ChatTransport` is spelled `TutorTransport`, and a chat lab would
import `useTutor` to run a conversation that has no tutor in it. The names are
wrong and the code is not; renaming them is the first commit of the split, not
a reason to do it early.

Legacy makes the same distinction the same way, which is the strongest argument
that the seam is real: `ChatWorkspace` takes `hiddenContextCallback` and
`chatButtons` as PROPS — generic slots — and `AiTutorChat` fills them with
tutor-flavoured values. The plumbing owns the slots; the tutor owns what goes
in them.

## 3. The three seams

Everything hard about this port is that the legacy code reaches sideways into
studio. Three places do it, and each becomes an interface the host implements.

**Transport.** `submitChatContents` branches on
`shouldUseAiGateway(modelId)`: either `performClientApiChatCompletion` (the
Vercel `ai` SDK against `apps/src/aiGateway`, with Turnstile) or
`postAichatCompletionMessage` (Rails). A third and fourth implementation —
fixtures and a dev key — are the whole point of this package, so the branch
becomes a strategy object rather than an `if`.

**Context.** `AiTutorContextHelper` (abstract, per-lab subclass) turns a
`AiTutorContext` bag — source code, hidden source, validation contents and
results, instructions, documentation, console output, `hasRun`, `hasEdited` —
into one string prepended to each request. The _format_ is shared and ports
verbatim; the _gathering_ is the lab's and becomes a callback.

Done as `TutorConfig.context`, which returns the BAG and not the string. The
subclassing bought a per-lab `getAiTutorContext` and two fields set once per
lab, and both are better said by passing an object — there is nothing for a
base class to hold when the string builder is the only shared behaviour. That
the wording stays on this side is the point, and the legacy header says so:
"conversion to a system prompt string should be kept here for coordination and
consistency". A lab that phrased its own would be tuning against a different
input from every other lab.

**Actions.** A structured response carries files. `useAiTutorResponseSchemaSettings`
dispatches `setSource`, `setViewingAiTutorVersion`,
`setProjectSourceBeforeAiTutorVersion`, `setAiTutorVersionFiles` into weblab2's
project redux, then a second UI reads them back to offer Accept/Reject. The
package must not know what a project is; it emits an action and the host
applies it.

## 4. Layers

```
   host lab  ──  TutorConfig { transport, context(), actions?, prompts? }
       │
       ▼
   <AiTutorPanel/>            ← the resource-panel tab; the socket in §1
       │
   session store              ← messages, pending turn, errors (redux slice)
       │
   TutorTransport             ← one interface, four implementations
       ├─ FixtureTransport      recorded replies, no network      (§6)
       ├─ DirectTransport       dev key via local proxy           (§7)
       ├─ GatewayTransport      the `ai` SDK path, as today
       └─ DashboardTransport    Rails, as today
```

The package depends on `react`, `@reduxjs/toolkit`, the component library and
`@code-dot-org/core`. It must not depend on `@code-dot-org/labs-base`: the
resource panel imports the tutor, not the other way round.

## 5. The transport

One method. Everything studio-shaped is in the request, put there by the host.

```ts
export interface TutorTransport {
  complete(request: TutorRequest, signal: AbortSignal): Promise<TutorReply>;
}

export interface TutorRequest {
  /** What the student typed, plus display text when they differ. */
  message: PendingMessage;
  /** Prior turns, already filtered to status 'ok'. */
  history: CompletedMessage[];
  /** §3 context, assembled and stringified by the host. Not shown, not stored. */
  hiddenContext: string;
  systemPrompt?: string;
  /** Set when the session wants files back rather than prose (§8). */
  responseSchema?: JsonSchema;
  /** Opaque to the package; the dashboard transport needs level and channel. */
  session: TutorSessionInfo;
}

export interface TutorReply {
  /** The user turn echoed with a requestId, then the assistant turn. */
  messages: CompletedMessage[];
  /** Parsed once here, so no caller re-parses `chatMessageText`. */
  structuredOutput?: unknown;
}
```

The message model ports close to unchanged from
`apps/src/aichat/types/chatEvents.ts`: `PendingChatMessage` /
`CompletedChatMessage` / `ErrorChatMessage`, discriminated by `status`, with
`updateId` for in-place update and `requestId` for server identity. That model
is sound and the predicates (`isChatMessage`, `isNotification`, …) are worth
keeping. What is dropped is `ServerChatEvent` and the teacher-feedback fields,
which come back with §12.

`AbortSignal` is new. The legacy path has no cancel, and a fixture transport
with a scripted delay makes the absence obvious the first time anyone clicks
away mid-answer.

## 6. Fixtures

A fixture is a **transcript**: an ordered list of turns, each a matcher and a
reply. It is JSON, it lives in `src/fixtures/*.json`, and the fixture transport
is a pure function of it — no clock, no network, no randomness beyond a delay
the test can advance.

```jsonc
{
  "name": "asks for a bouncing ball, accepts the change",
  "turns": [
    {
      "when": {"contains": "bounce"},
      "delayMs": 400,
      "reply": {
        "text": "Try giving the ball a velocity…",
        "structured": {
          "answer": {
            "answerType": "buildJavaScript",
            "explanation": "…",
            "code": [{"filename": "main.js", "sourceCode": "…"}],
          },
        },
      },
    },
  ],
  "fallback": {"text": "I can help with the code in this project."},
}
```

Matchers, in the order they are tried: `turn` (the nth request, whatever it
says), `equals`, `contains`, `matches` (a regex source). A turn with no
matcher matches once, in order — which makes the common case, a straight-line
scripted conversation, need no matchers at all.

A reply may fail instead of answering, because every failure path has UI that
is otherwise unreachable without a server. There is no separate error
vocabulary: a failure is a `status`, drawn from the same
`AiInteractionStatus` the real path uses, because that field is the only thing
the panel consults when it chooses what to say about a failed turn.

```jsonc
{"reply": {"userStatus": "profanity_violation"}} // the model is never called
{"reply": {"userStatus": "pii_violation"}}
{"reply": {"userStatus": "user_input_too_large"}}
{"reply": {"status": "model_timeout"}}           // the answer failed
{"reply": {"status": "model_rate_limited"}}
{"reply": {"status": "error"}}                   // the copy of last resort
{"hang": true, "reply": {}}                      // never answers; exercises abort
```

The split between `userStatus` and `status` is not decoration. Three of the
failures are about what was TYPED, and land on the student's own message: the
model is never called, so there is no assistant turn to carry them
(`generateChatResponse` returns before it builds one). A reply with a failing
`userStatus` therefore contains one message, not two — which is the shape the
real profanity path produces, and the only way to reach that UI without
misbehaving at a live server on purpose.

Two consumers, and they are why fixtures come before UI:

1. **Tests.** `vitest`, jsdom, real components, fake transport. The send path,
   the pending state, the accept/reject flow and every error branch are
   testable with no mocking framework and no network stub.
2. **The demo page.** The package's own `index.html` under `vite`, with a
   fixture picker — the panel, standing alone, with no studio and no key. This
   is what makes review possible for anyone who cannot get a model credential,
   and it is the harness `frontend-lab-browser-verify` describes for the world
   lab.

Recording is a later convenience: a `record` mode on a real transport that
writes the transcript it saw. Not milestone one — hand-written fixtures are
better documentation anyway.

## 7. The dev proxy

Optional, dev-only, and off unless a key is present.

A Vite plugin in this package (`src/dev/keyProxy.ts`) mounts `POST
/__tutor/complete` on the dev server. It reads a key from the **node process
environment** — never `import.meta.env`, never anything the client bundle can
see — and forwards to the provider. `DirectTransport` in the browser talks
only to that localhost route.

```
browser ──POST /__tutor/complete──▶ vite dev server ──▶ api.anthropic.com
                                    (holds ANTHROPIC_API_KEY)
```

Rules, all of which are load-bearing:

- The plugin refuses to mount when `mode === 'production'`, and `vite build`
  must not emit it. A key path that can ship is a key path that will.
- No key in the environment ⇒ the plugin does not mount, `DirectTransport`
  fails to construct, and the demo falls back to fixtures with a visible note.
  Silence here reads as "the tutor is broken".
- **It has none of the production safety.** The dashboard path runs input
  profanity classification, output image moderation, and Turnstile
  (`generateChatResponse`, `apps/src/aiGateway/turnstile`). The proxy runs a
  developer's own key against a developer's own prompt and asserts nothing.
  Say so in the README, and keep the two transports from sharing a name.
- Provider-shaped, not model-shaped: whatever the key is for. The legacy code
  is bound to `AiChatModelIds` from `generated-scripts/sharedConstants`, which
  is a studio artifact; this package takes a model _string_ and lets the
  transport decide what it means.

## 8. Agentic actions

The structured path, ported from `aiTutorStructuredResponseHelper.ts`:

1. The session declares a `responseSchema` (`aiTutorResponseJsonSchema` — an
   object with one `answer`, itself `{answerType, explanation, videoUrl?,
code: [{filename, sourceCode}]}`).
2. The reply arrives parsed as `TutorReply.structuredOutput`.
3. `answerType` decides: one of the host's declared rewrite types with files
   the host can place becomes a **proposal**; anything else is formatted as
   prose and shown as a normal message.

   BOTH HALVES OF THAT TEST ARE THE HOST'S, and neither can be guessed here.
   Which answer types mean "I changed your files" depends on what the lab asked
   the model for (`['buildHTML', 'buildCSS', 'buildJavaScript', 'buildJSON']`
   in weblab2); which file types can be applied depends on what a project in
   that lab is made of. So `TutorConfig.proposals` carries both, and omitting
   it means the tutor never offers to change anything — the right default for a
   host with no way to apply an edit.

   The answer type alone is NOT enough. `buildJavaScript` carrying a `.py` file
   is a model doing something the lab cannot carry out, and the student is
   better served by prose they can read than by an Accept button that would put
   a Python file in a web project.

4. A proposal is emitted to the host as one value:

```ts
export interface TutorProposal {
  explanation: string;
  files: Array<{path: string; contents: string}>;
  accept(description: string): void;
  reject(): void;
}
```

The host decides what a file is, whether the workspace goes read-only while
the proposal stands, and what a version commit means — all of which weblab2
currently does inside a redux callback that this package cannot import.

APPLIED WHEN OFFERED, not when accepted, which is the legacy order and the
better one: `onPropose` fires as the answer lands, so Accept and Reject are a
decision about an edit the student can SEE rather than a description of one.
Accept is two steps because it saves a version and a version wants a name;
Reject is one, because undoing something you did not ask for should not
require a form. What
the package owns is the chat-side half: the proposal message, the file chips,
the Accept/Reject buttons, and the two notification events
(`aiTutorVersionActionAccept` / `…Reject`) that already exist in the legacy
`Notification` union.

The `answerType` vocabulary and the prompt markdown that produces it
(`prompts/answerTypeTriggers/*.md`, `answerTypeContracts/*.md`) port as data,
unedited, so a change to studio's prompts is a diff against this package's
copy rather than a silent divergence.

## 9. State

Redux, as a slice the host injects — the pattern
`frontend/packages/labs/base/src/redux/store.ts` already uses via
`injectSlices` from `@code-dot-org/core/redux`. The package exports
`aiTutorSlice` and never assumes a root state.

What the slice holds: the event list, the pending turn, staged context, the
current proposal. What it must **not** hold, and what the legacy
`submitChatContents` reads from five foreign slices: `state.progress`,
`state.lab`, `state.lab2Project`, section access level, view-as user. All of
that arrives in `TutorRequest.session`, supplied by the host. That is the
difference between a package and a directory: the demo page in §6 has no
progress slice at all and must still work.

## 10. Milestones

| #   | Deliverable                                         | Done when                                                                                  |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Message model, `TutorTransport`, `FixtureTransport` | **done** — 34 tests drive a scripted conversation and every failing status; no UI          |
| 2   | Panel UI — list, composer, waiting, errors          | **done** — `yarn dev` holds a fixture conversation end to end                              |
| 3   | Context assembly + suggested prompts                | **done** — a test asserts the whole `hiddenContext` string, byte for byte                  |
| 4   | Dev proxy                                           | **done** — `/__tutor/status` gates the demo's live option; no key degrades visibly         |
| 5   | Structured responses + proposals                    | **done** — a fixture proposal renders chips and Accept/Reject; the host gets the files     |
| 6   | `DashboardTransport` + resource-panel socket        | **done** — the block in `ResourcePanel.tsx` is real code; no lab passes a config yet (§12) |

1–5 need no server and no studio. 6 is the only one that does, which is why it
is last.

## 11. Testing

Per `frontend/docs/conventions/packages.md`: vitest, `src/**/__tests__/*.test.tsx`,
jsdom via `@code-dot-org/lint-config/vitest/react.mjs`. The fixture transport
is the whole test strategy — there is no HTTP to intercept, so there is nothing
to mock.

AND A BROWSER, because jsdom does not paint. The first run of the demo page
under Playwright showed the student's own question tinted as a REJECTED one for
as long as the answer took to arrive: `unknown` is not-yet-settled, the tint
read it as not-`ok`, and every test passed because a class name is not a
colour. Every milestone from here ends with the demo driven in a real browser.

## 11.1 What is wired, and what is not

The socket is filled. `ResourcePanel` takes an `aiTutor?: TutorConfig` and
renders the tab from it; Codebridge's `InfoPanel` passes one through, so any
Codebridge lab can supply one. `labs/base` injects the slice into the shared
store, so a host does nothing but pass the config.

WEB LAB PASSES ONE (`labs/web/src/aiTutor`). It is the tutor's home lab:
`weblab2` is the one app name in `APPS_WHERE_AI_TUTOR_IS_ESSENTIAL`, so the tab
is always there and a teacher who switches AI chat off gets a tab that says why
rather than no tab; and the accept/reject flow in §8 was written against this
lab's answer types. Its three pieces are the three a host owes:

| It supplies     | Which is                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `context`       | every readable file, path and all, minus validation, system support, `txt`/`csv`/`md`, and image bytes |
| `proposals`     | the four `build` answer types, `html`/`css`/`js`/`json`, and a merge into `MultiFileSource`            |
| `disabledState` | `disabledStateFor` over the user's access level, the section's, and the predict gate                   |

Its standalone harness answers from a RECORDING rather than the dashboard —
there is no Rails behind the mock API, and a completion posted into a handler
that does not exist is an error rather than a demo. `main.tsx` declares it
(`useRecordedTutor`), because the harness is the thing that knows; sniffing
`import.meta.env.VITE_API_MODE` was tried and is wrong twice, since Vite does
not expose shell variables there and whatever value it had would be inlined into
the built library for every consumer of it.

The harness also stands in for the signed-in student, since the mock has no
users handler and the access rules read silence as no permission. The two
pretences are separate calls on purpose: a transport that quietly granted access
would be an access decision hidden inside a network choice.

No other lab does. World Lab would need something else entirely — its project is
Blockly workspace JSON, and a model shown that is being shown serialised block
positions rather than a program.

The rules are here — `shouldShowAiTutor`,
`areAiChatToolsEnabled` and `disabledStateFor` are ported from
`aichat/helpers/aiChatAccess.ts` and `useAiChatDisabledState`, and the panel
renders the disabled state. What is missing is the INPUT.

They are pure functions taking the facts, not a hook reading them, for the
reason everything else in this package takes its studio facts from the host: the
four values the legacy hook selects — the user's own access level, the selected
section's, whether they are a teacher, whether they are a levelbuilder — are not
in this package's state and should not be.

THE STATE IS NOW CARRIED. `@code-dot-org/users`' `currentUserSlice` reads
`ai_chat_access_level` and `is_levelbuilder`; `core`'s `ConciseSectionSchema`
has `ai_chat_access_level`. All three are OPTIONAL, and that is the decision
worth recording: whether the endpoints these parse actually send the fields has
not been checked against the serializer, and the two ways of being wrong are not
equal. A required field the server omits makes every section fail to parse; a
permissive default puts an AI tool in a classroom that did not ask for one.
Optional, with silence read as no (`areAiChatToolsEnabled`), is wrong in neither
direction — a field that never arrives yields a tutor nobody can use, which is
visible and safe, rather than one nobody authorised.

WHAT IS LEFT IS WIRING, in the lab. A lab that wants the tab must:

    const accessLevel = useAppSelector(s => s.currentUser.aiChatAccessLevel);
    const section = useAppSelector(selectedSectionSelector);

    shouldShowAiTutor({appName, isTutorLevel, aiChatAccessLevel: accessLevel})
      ? <InfoPanel aiTutor={{transport, context, prompts,
          disabledState: disabledStateFor({...})}} />
      : <InfoPanel />

and until one does, no tutor appears anywhere — which is the right default while
the fields are unverified.

Two smaller gaps of a different kind:

- **Copy Chat History.** The other of the two buttons legacy puts in the panel
  header; it belongs with the chat-history feature (§2). Clear Chat is done —
  `TutorHeaderButtons`, rendered by `ResourcePanel` on the tutor's tab, and
  blocked while a proposal stands, because clearing would take away the only
  Accept and Reject there are.
- **Teacher view.** Reading a student's transcript, and flagging a response,
  are the chat-history feature (§2, §12).

## 12. Open questions

- **Chat history.** `fetchUserChatHistory` and the teacher's read-only view are
  server-shaped. Does a `frontend/` lab need them at launch, or does the tutor
  start each session empty?
- **Model selection.** Legacy is pinned to `AiChatModelIds` from
  `generated-scripts/sharedConstants`, generated by Rails. A package cannot
  import that. Take a string and let the host name the model?
- **Turnstile.** The gateway path is bot-gated. Is `GatewayTransport` in scope
  at all, or does studio keep using `DashboardTransport` and the gateway stay
  in `apps/`?
- **Analytics.** `sendLab2AnalyticsEvent`, `EVENTS.AI_TUTOR_*` and
  `analyticsReporter` are studio singletons. Emit events through a host-supplied
  reporter, or drop them from the package.
- **i18n.** Legacy strings come from `commonI18n` / `lab2I18n`. Where do this
  package's strings live?
- **The English-only warning.** `views/AiTutorEnglishOnlyWarning.tsx` — does it
  come along?
- **`docs/architecture.md`.** Convention wants one for a non-trivial package.
  Write it when §4 stops moving; duplicating it now would just be two drafts.
