# Enhancements

## The problem

The Health Bar is not a thing. It is a RELATIONSHIP: a bar, an actor with
health, and a line pointing one at the other.

Everything in the lab was built for things. `Import…` writes a file into a
folder and touches nothing else, which is exactly right for a Coin and exactly
useless for a bar — importing one gives a project a file that draws an empty
track and stays that way. The recipe for making it mean something lives in the
actor's own DESCRIPTION, in prose:

> Point it at an actor with "subject" and it shows how much health that actor
> has left. Put it in the corner for a HUD, or add "Attached" to have it ride
> above the actor it is about.

Four edits across three files, three of which are only correct together. **A
description that contains a recipe is a recipe missing from the lab.**

The demo shelf found the same hole from the other side: the Health Bar is the
one stock actor that cannot be filmed, because a demo of it needs an actor with
health and nothing on the shelf has any (specs/RULE_DEMOS.md). That gives a
test:

> **If a stock actor cannot be demonstrated without a second actor the shelf
> does not have, it is an enhancement in disguise.**

## What an enhancement is

A patch, applied to an actor a project already has: rules imported, traits
elected, a companion actor placed, and the lines that aim them at each other.

**It writes blocks the learner could have written.** Everything an enhancement
does is ordinary rows appended to the chain under a `define actor` or a
`define world` — the same blocks the toolbox offers, in the order somebody
would have dragged them (`actors/enhance/patch`). Nothing is marked, hidden or
owned by the library afterwards. What it leaves behind is a project, and
deleting the rows undoes it.

**It appends at the end.** A row inserted into the middle of somebody's chain
moves their blocks about, and a world's wiring has to come after its placements
anyway: `set subject of ⟨the bar⟩` acts on a bar that has been added.

**It is idempotent.** Enhancing twice is a thing that will happen, because a
learner who cannot see what changed will do it again. Every edit asks whether
its row is already there, so the second time is a no-op rather than a second
bar.

**It says what it will touch, before it does it.** This is the only act in the
lab that edits files a learner made, so the dialog lists what lands in the
project the way the import shelves list what an import brings.

## What earns the name

More than one edit, or a companion actor, or a line aiming two things at each
other. Anything that is only "elect this trait" belongs on the rule shelf,
which offers exactly that in two clicks and should not be duplicated here.

## Where it is asked from

**On the actor's own row**, beside Rename, Clone and Delete — the menu for
things done TO one file (`files/FileMenus`). Enhancing is done to an actor, so
choosing the actor is not a question the dialog has to ask: it is answered by
whose row the menu belongs to, and the dialog's title says which one it is
about.

That is the first place and not the only one. The next is a wand on the
`define actor` block itself, which would also reach an actor a WORLD defines
for itself and which has no file to have a row — a second kind of address for
the same question, which is why the seam takes a target rather than reading
one (`actors/enhance/actorEnhance`).

## The first one: health, and a bar above it

    actors/<target>.actor    use trait ⟨Health#Has Health⟩
    actors/healthBar.actor   use trait ⟨Attachment#Attached⟩
    worlds/*.world           add actor ⟨Health Bar⟩ as ⟨<target>Bar⟩ do:
                               set subject of ⟨<target>Bar⟩ to ⟨any ⟨target⟩⟩
                               set attached to of ⟨<target>Bar⟩ to ⟨any ⟨target⟩⟩

**`as ⟨name⟩` rather than `any ⟨Health Bar⟩`**, which is what the bar's own
header suggests and what the starter world does. Naming the bar it just placed
means a project may hold a second one — a HUD bar for the player, a rider over
an enemy's head — and an enhancement touches only the one it made. The KIND is
still good enough for the subject, because "the player" is one actor in the
games this is for; the day it is not, that line is the one to change.

**No offset**, though a bar over a head plainly needs one: 24 above is already
the Attachment rule's default, chosen there for this. A line saying what would
have happened anyway is a line to keep in step with a default that may change
for a reason.

**Every world**, because a bar belongs to the level it is drawn in and a
project with two levels wants one in each. A world that never places the target
gets a bar pointed at nobody, which draws as an empty track — the same thing
that world would show for any actor it does not have.

## Testing one

Two halves, and the second is the one that matters. The patch's arithmetic —
what it imports, that it is idempotent, that it refuses what it should — is
ordinary unit work. Whether the blocks it wrote are the RIGHT blocks is a
question only compiling and running the project answers, so
`actors/enhance/__tests__/health` does that: it enhances a Platformer Player,
compiles the project with the real generator, and asserts that the bar draws
the player's health, halves when the player is hurt, and rides above it as it
falls. Cutting any one of the three wiring lines fails it.

## The catalogue this opens

Named here because the shape is worth seeing before the second one is built,
and because each is an argument for the concept rather than a plan:

- **A meter for something it already has** — the health bar; a cooldown bar
  wired to Shooting's reload; a stamina meter. The interesting question each
  one asks is _attached or HUD_, which is the thing a learner cannot guess.
- **A second pool that bends a rule's arithmetic** — shields (absorb before
  health, a step ahead of Health's), armour, lives and respawn (`dies` is
  already an event), and the flicker that makes Health's existing mercy time
  visible.
- **A voice** — a Speech Box that rides above an actor, a name plate, a
  floating "+10". Composition of Writing and Attachment, no new rules.
- **A verb it did not have** — collects things (which is exactly the hole the
  Coin's demo falls into), shoots, patrols, is pushable, hurts to touch.
- **A relationship with the world** — the camera follows this one; stays in
  bounds; is a checkpoint. No picture at all, pure wiring, and the first of
  them answers the commonest "my game is broken" that is not a bug.
- **A look that reports state** — flicker while hurt, tint while powered up, a
  trail of fading copies.
