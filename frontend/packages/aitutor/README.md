# @code-dot-org/aitutor

The AI Tutor chat panel, as a package: the tab a lab mounts in its resource
panel, which sees the student's project, answers questions about it, and can
hand back a set of file edits the student accepts or rejects.

Ported from the legacy bundle — `apps/src/aiTutor`, `apps/src/aichat` and
`apps/src/lab2/views/components/AiTutorChat.tsx` — with the studio couplings
turned into interfaces the host implements, so the panel also runs with **no
server**: against recorded fixtures, or against a developer's own API key
through a dev-only local proxy.

All six milestones of [`specs/PLAN.md`](specs/PLAN.md) are done. The panel
runs, knows what to say about a project, can offer a set of file edits, and
reaches a model four ways.

**No lab switches the tab on yet.** The access rules are here —
`shouldShowAiTutor`, `areAiChatToolsEnabled`, `disabledStateFor` — as pure
functions a host calls with its own state, and that state is now carried by
`currentUser` and the section schema. What is left is a lab calling them. See
`specs/PLAN.md` §11.1.

    yarn dev     # the panel, standing alone, answering from recordings

## What is in here

Two layers, split by directory. `model/`, `transport/`, `dev/` and `session/`
are generic chat plumbing — a chat-based LAB would want all of it unchanged.
`context/`, `prompts/` and `AiTutorPanel` are the tutor's own: reading the
project a student is working on, and offering to change it.

They are one package because the boundary has one consumer today. When
`packages/labs/aichat` exists it becomes the second, and the plumbing moves out
whole. Until then the generic types are named for the tutor —
`TutorTransport` runs any conversation, tutor or not. See `specs/PLAN.md` §2.1.

## Where it plugs in

`frontend/packages/labs/base/src/resourcePanel/components/ResourcePanel.tsx`
already carries an `AiTutor` tab and a commented-out block naming the legacy
component. This package fills that hole; the call site is therefore already
fixed. See `specs/PLAN.md` §1.

## Transports

| Transport            | Needs                                 | Use                                 |
| -------------------- | ------------------------------------- | ----------------------------------- |
| `FixtureTransport`   | nothing                               | tests, and the standalone demo page |
| `DirectTransport`    | a key in the dev server's environment | trying real answers locally         |
| `DashboardTransport` | studio                                | production                          |

### Live answers, locally

    ANTHROPIC_API_KEY=sk-... yarn dev

The key stays in the Vite dev server's node process. The browser posts to
`/__tutor/complete` on its own origin and never sees it — a key a page can
reach is a key in the bundle. `/__tutor/status` says whether a proxy is there,
so the demo can offer a recording instead of failing on first use.

`TUTOR_MODEL` picks the model. A host's own dev server can mount the same
plugin:

```js
// vite.config.ts
import {tutorKeyProxy} from '@code-dot-org/aitutor/dev';
export default {plugins: [tutorKeyProxy()]};
```

**It runs none of the moderation the dashboard path runs** — no profanity
classification, no image moderation, no Turnstile. It is a developer's own key
against a developer's own prompt, it does not mount for a production build, and
it is not a thing to point at students. See `specs/PLAN.md` §7.
