# Drawing a picture to order

How the lab would reach the real service. Not built. This is what it would
take, what already exists, and the two things worth finding out before anybody
writes a line of it.

Two specs, and this is the further one. **`IMAGE_GENERATION.md`** is what the
lab DOES — the flow a learner walks and the seam it stands on, which is
buildable today against a fixture and needs nothing here. **This** is one of
that seam's three transports: the product one, which is a port and a policy
question. Nothing in the flow waits on it.

## What already exists, and where

Four pieces stand between a prompt and a `.png` in `sprites/`. Three of them
are built and running; one is the work.

| Piece          | Where                                    | State                                              |
| -------------- | ---------------------------------------- | -------------------------------------------------- |
| The service    | `~/ai-gateway`, a Cloudflare Worker      | Live                                               |
| The token      | `POST /ai_gateway/access_token` (Rails)  | Live                                               |
| The client     | `apps/src/aiGateway/` — ~1000 lines      | **In the webpack bundle, not reachable from here** |
| The image work | Sprite Lab's prompt shaping and clean-up | Live, and optional                                 |

**Sprite Lab already does this**, which is the closest precedent and a better
one than the aichat client an earlier draft of the wizard spec pointed at:
`apps/src/p5lab/spritelab/lab2/ai/images/imageGeneration.ts` takes a prompt,
gets a picture, and puts it in the project.

## Two things that are not what they look like

**The gateway has a `/generateImage` route and nothing in this repo calls it.**
`apps/src/aiGateway` exports `generateText` and `transcribe` and no third
thing; Sprite Lab draws by calling the TEXT route with an image model and
reading the `files` off the answer. So there are two ways in, and they are not
equal: the text route is exercised in production every time somebody generates
a sprite, and the dedicated route is purpose-built, better shaped — it takes
`{model, prompt, images, mask, n, size, seed}` and refuses any model id not on
its list — and unexercised from here. **Follow Sprite Lab first.** A door that
works the way a shipped one works can be moved to the better route later; a
door that is the first caller of anything is two unknowns at once.

**Turnstile is a gate on every route, and it is inert today.** The Worker
checks it before it routes, and takes the enforcement mode from the verified
token rather than from the request — so a client cannot choose its own level.
`AiGatewayAuthController` does not mint that claim, and the Worker's own note
says an older Rails that sends nothing parses to `disabled` and "keeps the
deploy inert". So the client's 380 lines of Turnstile — a third of it — are
**not needed to make a request work today**, and will be the day Rails starts
minting the claim. Port the shape that can take it; do not port it now.

## The obstacle: the client is in the bundle

`apps/src/aiGateway` is not a file to copy. It imports
`@cdo/apps/util/HttpClient` and `../aichat/aichatContextManager`, neither of
which exists in `frontend/`, and this lab is a standalone package.

So the port is an EXTRACTION: a `frontend/packages/ai-gateway`, with
`apps/src/aiGateway` re-exporting from it so there is one implementation rather
than two that drift. That is the move `AnimationThumb` and `EnhancementRows`
just made inside this lab, two orders of magnitude up — and it runs against the
usual direction of travel in this repo, where `frontend/` packages are consumed
BY `apps/` rather than carved out of it.

**The context is the design question, not the typing.** The token request sends
`clientType`, `levelId`, `scriptId`, `channelId` and `lessonId`, and Rails
AUTHORISES on them — `can_access_aichat_chat_completion?` is asked of the
client type and the level before a token is minted at all, and a user whose
region blocks the models is refused outright. A standalone package cannot read
that from a webpack-global singleton; its host has to supply it. What a world
lab running inside a level supplies, and what the dev harness supplies when
there is no Rails behind it, are two different answers and both are needed.

## What the lab's own side needs

Almost nothing, which is the happy part. An image the project holds is bytes on
a URL in a folder — exactly what `importStockBackground` writes and what an
upload writes — and the picture step already offers whatever is in `sprites/`.
So the door's job ends at "write a `.png` into the project", and everything
after that is machinery this lab already has.

## Safety, which is a question and not a task

An earlier draft of the wizard spec said the port must bring aichat's
moderation with it. **That is not what the lab path does.** Sprite Lab's own
sibling says so plainly: "Prompt safety is whatever the gateway enforces; the
aichat moderation pipeline is not on this path"
(`p5lab/.../ai/askSpriteLabAi.ts`).

That is a decision somebody made about the lab paths, not an oversight to copy
or to quietly repeat. A picture drawn to order is the one thing that reaches a
learner from outside without a person having looked at it first, so **what the
gateway enforces, and whether it is enough for this**, is a question for
whoever owns that path — asked before the door ships, not after.

## What a spike would need before it could run

Not just a dev server. Four things, and two of them are gates rather than
chores:

| Needed                                   | Where it comes from                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| Rails running                            | `bin/dashboard-server` — the token route is Rails'                       |
| A signed-in user who passes the check    | `can_access_aichat_chat_completion?`, asked of a client type and a level |
| `ai_gateway_auth_key` and its passphrase | **AWS Secrets Manager**                                                  |
| Somewhere to send it                     | `AI_GATEWAY_URL`, hardcoded                                              |

**The secrets are the gate.** `ai_gateway_auth_key` is `!Secret` in
`config/development.yml.erb`, which resolves through `Cdo::Secrets` to AWS
Secrets Manager — not a value a `locals.yml` carries. Without credentials for
that account Rails cannot sign, and there is no token to send anywhere.

**There is a non-production gateway and the client cannot reach it.**
`wrangler.jsonc` defines an `ai-gateway-development` environment, and the
Worker names exactly three production hostnames in `isProduction`. But
`apps/src/aiGateway/shared.ts` hardcodes `https://ai-gateway.code.org` with no
override — so a spike as the code stands would mint a token on somebody's
laptop and spend real inference against production. That is a thing to decide
on purpose rather than to discover. **Making that URL configurable belongs in
the extraction**, and is one of the few concrete additions the port needs
beyond moving files.

And local Rails tooling has been unreliable in this checkout before — `rails
runner` under spring and the mysql reader have both failed here. That was CLI
tooling rather than the server, so `bin/dashboard-server` may be fine; it is
not an assumption to rest a plan on.

## What to do first, in order

The three unknowns are not equally expensive, and they are listed here in the
order they cost.

**1. Read whether Rails would mint a token for this lab at all.** Free: no
server, no secrets, no gateway. `can_access_aichat_chat_completion?` is asked
of a `clientType` and a level, and World Lab has no client type. The answer is
either "add one", which is a small change, or "this is not a thing a World Lab
user is allowed to do", which settles the whole door — and it would be a waste
to learn that after extracting a package.

**2. Read whether Turnstile is in the way.** Already done, above: Rails mints
no enforcement claim, so it parses to `disabled`. Nothing to run.

**3. Then the round trip.** Only this one needs the server, the secrets and a
decision about which gateway to point at — and it is worth doing only once the
first question has come back "yes".

## What it is not

Not a way to put a model in the lab's hands. The door draws ONE picture into
`sprites/`, as a file the learner owns and can open in the image editor and
paint over. Everything after the bytes land is the lab's ordinary machinery,
and there is nothing here that knows what the picture is for.
