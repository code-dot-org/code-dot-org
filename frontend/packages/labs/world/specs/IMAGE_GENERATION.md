# Making a picture from a prompt

The lab's own side of drawing to order: the flow a learner walks, and the seam
it stands on. Not built.

Two specs, and this is the nearer one. **This** is what the lab does — the
question it asks, the picture it writes, and the three ways the bytes can
arrive. **`AI_IMAGE_GENERATION.md`** is one of those three: what it would take
to reach the real service through the AI Gateway, which is a port and a policy
question and is not on the critical path for building any of what follows.

## The problem with waiting

The fifth door of the picture step needs a service the lab cannot reach yet
(`ACTOR_CREATION_WIZARD.md`). The service needs a client extracted out of the
webpack bundle; the client needs a token; the token needs Rails to decide that
a World Lab user may ask for one at all — a question nobody has answered.

None of that is the flow. What a learner does is type a few words, wait, look
at a picture, decide, and either keep it or ask again — and every design
question in that is answerable with no key, no network and no model. So the
door is built against a SEAM, and the seam has an answer that needs none of the
above.

## Three ways the bytes arrive

The tutor in this same lab is built exactly this way, and the shape is worth
copying rather than reinventing (`@code-dot-org/aitutor`, `aiTutor/transport`):

| Transport | Talks to                               | For                             |
| --------- | -------------------------------------- | ------------------------------- |
| Fixture   | a handful of `.png`s in the repo       | anyone, always — and every test |
| Direct    | the Vite dev server, which holds a key | a developer trying it locally   |
| Gateway   | Rails, then the AI Gateway             | the product, once it exists     |

**The fixture one is not a stub, it is the one that gets used most.** Every
test of the flow runs on it, every screenshot comes from it, and a developer
with no key sees the whole door work. It should return more than one picture,
and it should be slow on purpose — a generator that answers instantly designs a
flow with no waiting state in it, and waiting is most of what this flow is.

**Which one is chosen is decided BEFORE anything renders**, as the tutor's is.
A door that offers to draw and then fails on the first press reads as broken;
one that knows it has no service can say so, or not offer. `proxyStatus()` is
the existing shape of that question.

## The dev proxy, and why its rules matter more than its code

A Vite plugin serving a route on the dev server's own origin, holding the key
in the node process:

    browser ──POST /__images/generate──▶ vite dev server ──▶ the provider
                                          (holds the key)

`@code-dot-org/aitutor`'s `dev/keyProxy` is the template, and what is worth
copying is its FENCES rather than its HTTP:

- `apply: 'serve'`, so Vite never runs it in a build and there is no path by
  which it reaches a bundle.
- It refuses to mount when `mode === 'production'`, which is `vite preview` and
  anything else serving a built site.
- The key is read from the NODE PROCESS and never from `import.meta.env` — Vite
  inlines the latter into the client bundle, which is the whole accident the
  proxy exists to prevent.
- No key means it does not mount, and the status route says so.

And the protocol between the two halves is the LAB's, not the provider's: the
browser half knows nothing about who draws, the node half knows nothing about
the wizard. That is what makes pointing it somewhere else a day's work rather
than a rewrite — the tutor's own protocol file says so, having been pointed
somewhere else.

**It runs none of the moderation a product path would.** That is the difference
between a developer trying something locally and a lab serving students, and it
is why the transports must not share a name.

## What the flow is

    ┌ what shall it look like? ────────────────────────┐
    │  the project's pictures         …and animations   │
    │  ──────────────────────────────────────────────── │
    │  or describe one:  [ a purple crab       ] [Draw] │
    │                                                   │
    │  ┌──────┐ ┌──────┐   ← what came back             │
    │  │      │ │      │     press one to keep it       │
    │  └──────┘ └──────┘     [Ask again]                │
    └───────────────────────────────────────────────────┘

**It is a way of answering the picture step, not a step of its own.** What it
produces is a `.png` in `sprites/`, which is what that step was already
offering — so a generated picture is a picture, indistinguishable afterwards
from one imported or drawn, and openable in the image editor like any other.

**What lands is a file the learner owns.** Bytes on a URL in a folder, written
the way an upload writes one (`files/FileMenus.tookUpload`,
`appearance/importStock`). Nothing marks it as generated; there is nothing to
un-generate.

**More than one at a time**, because choosing between two is a different act
from accepting one, and a door that offers a single picture and a retry button
makes a learner reject before they can compare.

**Asking again keeps the words.** The commonest second action is a small edit
to the prompt, not a fresh thought.

## What this does NOT decide

- **Whether a World Lab user may generate images at all.** That is Rails'
  answer, through `can_access_aichat_chat_completion?`, and reading it is free
  (`AI_IMAGE_GENERATION.md`). The seam makes the flow buildable while the
  question is open; it does not make it shippable.
- **What safety the product path runs.** The dev proxy runs none, and says so.
  What the gateway enforces, and whether it is enough for a picture drawn into
  a learner's project, is asked in the other spec and answered in neither.
- **The prompt.** Sprite Lab shapes its prompts hard — a style clause, a flat
  key colour to cut out, a pixel-grid instruction — and then cleans up the
  result (`p5lab/.../ai/images/imageGeneration`). Whether this door wants any of
  that is a question for when there are real pictures to look at, and it belongs
  behind the seam either way.

## Where to start

The fixture transport and the seam, and the whole flow built on them. That is
the part with the design in it, it needs nothing from anybody, and it is what
makes the other two transports a matter of filling in one interface.
