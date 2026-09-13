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
- ~~**The prompt.**~~ _Decided, once there were real pictures to look at._
  `appearance/generate/imagePrompts` shapes one per kind, and the kinds are
  Sprite Lab's three because the job is the same job. What is NOT borrowed is
  its key colour: it floods a flat colour to transparency because its models
  would not draw transparency, and `gpt-image-1` takes a `background`
  parameter — so the ask is for real transparency, with no colour to pick and
  nothing to eat off the subject.

  A KIND IS A COMPOSITION, not a use, and naming them after the three doors was
  a bug rather than a shorthand. Asked for "a tileable ground surface … ice
  that the player is expected to slip upon", the Actor Creator's door wrapped
  those words in the clause for an `actor` — "draw only the subject, centred …
  no ground" — and the model did as it was told. The lab had only ever asked
  itself which door this was.

  So the kinds say how a picture meets its frame: `centered` (the subject
  alone, space round it), `filled` (edge to edge, running off all four sides),
  `tileable` (filled, and joining itself), `background` (a wide scene for the
  viewport). A use picks one, and only the backdrop shelf can pick without
  asking — a backdrop is a backdrop because of the folder it lands in.
  Everywhere a sprite is drawn the same folder holds all three, so the question
  is the learner's.

  Three things follow from the naming. The framing is said BEFORE the learner's
  words, since a model handed three drawable nouns has decided before the
  corrections arrive. The tileable clause refuses the objects by name — no
  tile, no block, no slab — because "a tileable ground tile" is how anybody
  would ask and a model handed the word draws one. And a tileable picture is
  shown REPEATED: a seam is invisible in one copy and obvious in nine, so the
  preview shows the promise rather than the picture.

## Where to start

_Done, in that order._ The fixture transport and the seam first, then the whole
flow on them, then the dev proxy: three doors (the Actor Creator's picture
step, the backdrop shelf, the sprites shelf) and one panel behind all three.
The gateway transport is still unwritten and still blocks nothing, which was
the point of starting here.
