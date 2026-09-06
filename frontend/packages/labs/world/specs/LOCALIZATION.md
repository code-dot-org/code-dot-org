# The words a learner reads, in the reader's language

## The problem

Nothing in this lab was translatable. The words on a stock rule's blocks are
baked into generated JSON at build time — `say: ['make', param('who'), 'jump']`
becomes the block's `message0` — and the lessons' instructions are English
string literals. For this host every learner-facing word has to be
translatable, and the generation step makes it harder than usual: a label is
decided before `yarn build:rules` runs, so a naive scheme makes every language
a rebuild of the whole shelf.

Blockly itself has no notion of localization. Its own messages come from
`Blockly.Msg`, but a block defined by this lab carries its words in the
definition, and there is nowhere for a second language to go.

And the words are not evenly translatable. A rule's blocks divide into things
a learner READS and things that are IDENTITY, and the two are next to each
other in the same object:

```js
{
  type: 'world_do_SolidBodies_PushOutOfSidewaysAction',  // identity
  message0: 'push %1 out of %2 sideways',                // read
  args0: [{name: 'BODY'}, {name: 'SOLID'}],              // identity
  tooltip: 'Pushes an actor out of a solid one sideways.', // read
}
```

Translate the wrong half and nothing complains. A translated `type` stops every
saved file loading; a translated argument `name` cuts the generator off from
its own value; a translated dropdown VALUE writes another language into the
project file. All three fail quietly and none of them fails now — they fail
when somebody opens the file again.

## What is built

`localizeBlocks` (`src/blockly/localizeBlocks.ts`) translates a block
definition before it is registered:

- `message0` … `message4`
- `tooltip`
- the LABEL half of every dropdown option, including the live ones, whose
  options are a function and are therefore translated when the dropdown opens
  rather than when the block is defined

It goes through `@code-dot-org/core/plugins/localization`, the same plugin the
markdown package uses. With no LocalizeJS loaded, `translate` is identity —
which is every test and every host today, so the seam costs nothing until a
locale arrives.

`localizeToolbox` does the same for the drawers — a category's name, and the
buttons and labels inside it. It is separate because a toolbox is not a block,
and it is necessary because the toolbox sits INSIDE the `notranslate` container
with the workspace, so nothing else would ever translate it. It runs last, after
every filter: three things select categories by name — the level's hidden
categories, the progression's shelf, and the `Block` drawer an event surface
keeps — and each would stop matching a name in another language.

`localizeText` is for the words the editor composes itself: a warning, a
message with a name in it. `translate` takes a string and gives a string, so
the interpolation is done here, with Blockly's own `%n`, which lets a
translation put the name where the language wants it:

```
Two of this rule’s members are both called “%1”.
“%1” heißen zwei Mitglieder dieser Regel.
```

Two more pieces make it real in the editor:

- The workspace sits in a **`data-notranslate`** container. LocalizeJS sweeps
  the DOM and rewrites text nodes; inside a workspace those are Blockly's own
  SVG, laid out from measurements Blockly took itself, so the sweep is kept out
  and the translation is done to the definitions instead.
- **`useLocalization`** re-runs the translation and reloads the workspace when
  the locale changes. Re-registering definitions changes what the NEXT block of
  a type will say and nothing about the ones already made: a block keeps the
  fields it was created with. Loading the workspace back into itself is what
  rebuilds them, and it is the same move a file switch makes.

## Why translating `message0` is enough

This is the good news, and it is what makes designed blocks — `define block`,
whose signature the learner wrote — possible at all.

A label is an interpolation, and Blockly binds `%n` to `args0[n - 1]` wherever
that `%n` appears. So a translation may put the arguments in a different order,
add words between them, or drop words entirely:

```
en:  push %1 out of %2 sideways
de:  %2 seitlich aus %1 herausdrücken
```

Those are two labels and one block. `%2` still means `args0[1]`, still named
`SOLID`, still the same socket taking the same type. Nothing has to understand
grammar, no argument moves, and a rule in another file calls it exactly as
before.

The rule that follows is: **translate `message0`, never regenerate `args0`
from it.** A scheme that parsed the translated string back into arguments
would be a scheme where a translator could break a project.

## What must never be translated

- **`type`** — the block's identity, what a saved file holds and what one rule
  calls another rule's block by.
- **an argument's `name`** — how the generator finds its value.
- **a dropdown option's second element.** An option is `[what is read, what is
stored]`. The first is words; the second is data.
- **anything in a label that is not words.** An actor's dropdown draws the
  actor, so its label is `{src, width, height, alt}` and the only readable part
  is the `alt`. Handing the whole object to `translate` is not a no-op: it
  walks an object it does not recognise field by field, and `width: 24` comes
  back `{}`. That one is not silent — Blockly refuses the option, the field
  throws while it is being built, and the lab comes up as "an error occurred
  while loading the lab".

Tests hold these against the whole real palette rather than a fixture, because
three of the four failures are silent and the palette is where they would
happen.

## A designed block's name IS its wording

`define block` is the case where the two halves — what is read and what is
identity — are the same characters. A designed member has no NAME field: its
name is `designedName(parts)`, the labels of its signature joined. So the
member's id, and the block TYPE every caller is written in, come from the words
on its face.

That is fine, and it is handled: retyping a word renames the member, and
`reconcileMembers` rewrites every call to follow — in this file and in every
other file that imports it. It is also the sharpest possible statement of the
invariant, because it was seen breaking three separate ways:

- **The reconcile not reached.** Renaming `kept between 0 and 1` to `clamped
between 0 and 1` left nine calls in one body still written in the old type,
  and nothing looked wrong: `standInBlocks` mints a definition for a dangling
  type, so every block still drew, nothing threw, and the rule quietly stopped
  working.
- **The reconcile reached per keystroke.** A rename rewrites the project and
  reloads the workspace, so running one between two keypresses threw away the
  block whose field was open. Typing over a name lost it on the first letter.
- **The reconcile reached and then undone.** A body is rebuilt from the
  interface snapshot taken when the pencil was clicked, and the save that
  follows `carry` closes over the sources of the render that made it. Left
  alone, the first put the old wording back on screen and the second put the
  old import back in the four other rules — `No matching export in
collisions.rule for import CollisionSizeOfQuery`.

`spikes/rule-surfaces/check-rename.mjs` holds the first two,
`check-rename-across-files.mjs` the third.

**Localization does not go near this, and that is by construction rather than
by luck.** `localizeBlocks` translates a block DEFINITION on its way to being
registered; `parts` live in the document and are never touched. So a locale
change cannot rename a member, and a French reader's calls are the English
reader's calls.

But it is the demonstration of what the discipline is protecting. If a
translation ever reached `extraState.parts` — a well-meaning pass that
"translated the rule file" — every caller of every designed block in the
project would break in exactly this way: silently, with stand-ins papering over
it, and only noticed when a game stopped working.

## A translation is not trusted with the arguments

A label and its `args0` are one thing, and Blockly checks that when the block
is DEFINED:

```
Block "…": Message index %3 out of range.
Block "…": Message index %1 duplicated.
Block "…": Message does not reference all 2 arg(s).
```

A definition that throws is not one bad block. It is the editor failing to
load — in that language and no other, so nobody testing in English would ever
see it. `safeMessage` compares the multiset of `%n` in the translation against
the English and keeps the English when they differ.

It refuses rather than repairs, deliberately. Reordering is the whole point of
translating a label, so anything clever enough to put a missing `%2` back would
have to know where it belongs in a language it cannot read. English a learner
can use beats grammar nobody can.

`%%` is an escaped per-cent and is stepped over. Read as an argument index, a
label saying `%%100` would look mismatched against a translation saying `%%50`,
and every label mentioning a percentage would silently stay English in every
language. No stock block says `%%` yet; the first one would have found this out
quietly.

## Names are not translated, and telling them apart takes a decision

A dropdown that lists the project — actors, traits, rules, files, the enums a
learner wrote, the tweens they defined — is listing NAMES, and a name is the
same in every language. A dropdown that lists the lab's own vocabulary — the
phases of a frame, the parameter types, `(no actors yet)` — is words.

These arrive by the same road and look identical in the code, so `liveDropdown`
takes a `words` flag and defaults it OFF. That is the safe way round: a
vocabulary list left untranslated reads as English, which somebody notices; a
name list translated by accident renames what a learner made, and an actor
called `Math` would come back as whatever the Math drawer is called in their
language.

Of the twenty-one live dropdowns, one is vocabulary (the phases). `orNone`
holds the fifteen `(no … yet)` placeholders, so those are one decision rather
than fifteen. `argumentTypeOptions` is the awkward one — `number`, `text`,
`actor` followed by the learner's enums — so it translates its own half and the
flag stays off.

## Slugs: measured, and not re-keyed

The first draft of this plan asked for block types to be keyed on a rule's id
rather than its name, so that translating a rule's name could not rename every
block type.

Measured, that is 466 distinct block types, 1,634 occurrences, 132 files — and
it buys nothing the invariant does not already give. Types are derived from the
STORED name, and localization never writes the stored name: it translates at
the display layer, on the way to the screen. So a translated name cannot reach
`ruleSlug`.

A learner renaming a rule still moves types. That is deliberate, it is what
renaming means here, and `renameRule` already rewrites every reference to
follow. The two cases only look alike.

So this is a discipline with a test behind it rather than a migration. The
discipline: **no translated string is ever stored, and no stored string is ever
translated in place.**

## Looking at it

`?pseudo=1` in the demo stands a marking locale in for LocalizeJS
(`src/demoPseudoLocale.ts`), so every translated string comes back
«áççéñtéd» — which turns "did this go through the seam?" into something a
person can see and a script can count.

It is loaded by its own script tag ahead of the bundle, and that is not a
detail: the localization singleton binds to `window.LocalizeLoader` when its
MODULE is evaluated, and an `import` is hoisted above every statement, so
installing it from inside `main.tsx` installed it after the thing that reads
it. The page came up in English and said nothing. A real LocalizeJS arrives the
same way — a script in the page, ahead of the app.

The stub also has to ANNOUNCE its dictionary. The plugin hands LocalizeJS its
callbacks and waits: nothing is translated until `dictionaryAdded` fires, which
is what makes it emit `change`, which is what `useLocalization` watches. A stub
with an inert `on` is a page of untranslated English, which was the first draft.

`spikes/rule-surfaces/check-locale.mjs` reads the result. As it stands, all 27
drawers translate, 47 of the 62 labels on `solid.rule` translate, and what does
not is a rule's name, an ability's, a property's, a step's, and the
descriptions the `.rule` file carries. Those are stored strings, and a stored
string is never translated in place. **Anything else that appears in that list
is a gap** — it is how `settle` was found, drawn by an extension that replaces
the options `localizeBlocks` had translated.

## What is left

- **Lessons and the catalogue.** 77 instruction blocks and 30 tile names, which
  go through the host's own lookup rather than this seam.
- **The 147 `doc` blocks.** Those are markdown, not labels: paragraphs with
  emphasis and inline code. The markdown package has its own localization path
  (`rehypeLocalize`), which is where they belong rather than in a block's
  message.
- **Ability names.** Shown to the learner and used as identifiers, which is the
  slug question again in a different coat.

## Caveats worth knowing

**Blockly's widget and dropdown divs mount on `document.body`**, outside the
`data-notranslate` container — so an open dropdown is inside LocalizeJS's reach
even though the workspace is not. This is the same escape the effect editor's
theme records about MUI portals, and it is recorded here rather than solved.

**`Blockly.Msg` must not be written to early.** `colorMessages.ts` has the
scar: `Agent.inject` loads English only `if (Object.keys(Blockly.Msg).length
=== 0)`, reading emptiness as "the embedder has chosen a locale". A single
override assigned before injection makes it non-empty, the locale never loads,
and every other message in the editor goes missing. Anything that puts messages
into `Blockly.Msg` has to load the locale first.

**The English string is the key.** Nothing here is keyed by hand, which is what
LocalizeJS works from — and it means a block whose wording is edited gets a new
key and falls back to English until it is translated again. That is the right
failure, but it does mean rewording a label is a translation cost.
