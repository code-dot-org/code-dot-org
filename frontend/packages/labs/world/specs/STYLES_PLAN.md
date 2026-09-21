# Plan: styles, tokens, and an interface that looks like one

STATUS: PLANNED. Nothing here is built.

The interface kit works and looks cheap. This is what to do about it, and the
argument for a shape rather than the first shape that occurred to anybody —
because the obvious answer (a Modern Button, a Classic Button, a Modern
Dropdown…) cannot theme anything, for three reasons the lab already knows.

## The problem, measured

Eighteen colour literals, thirty-nine times, across thirteen actor files, and
three declared colour properties in the whole kit (`text color`, `bar color`,
`track color`). The palette is real — `#8890b0` is the edge on nine controls,
`#ffd45e` the focus ring on five, `#202840` the surface on three — so the kit
already HAS a theme. It is retyped in every file, which is the only reason it
cannot be changed.

Retyping has already gone wrong in the two ways it goes wrong:

- **It drifts.** `#10141c` (Scroll View, Viewport), `#101828` (Speech Box) and
  `#1a1a22` (Text Input, Text Area) are three dark surfaces that differ by a
  few points of blue. Nothing chose that.
- **Constants get re-declared with different values.** `RING_INSET` is
  declared five times — Button 4, Dropdown 2, Toggle 2, List 2, Slider 1 —
  and exported by nobody. Five controls that mean to draw the same focus ring
  draw three different ones.

And colour is the smaller half. What reads as unpolished is shape:

- **Square corners everywhere.** Every control is `fillRect` and `strokeRect`.
- **A hard 2px outline on everything**, where an interface uses a 1px quiet
  border or no border and elevation instead.
- **No elevation at all.** A Dropdown's open menu has no shadow, so it reads
  as part of the page rather than over it.
- **No pressed state.** A Button held down is pixel-identical to one at rest.
  Only focus draws anything.
- **One font weight.** `fontAt` is `${size}px ${FONT_STACK}`, so a Button's
  caption and a Panel's title are the same text.

A theme that only swaps colours leaves every one of those in place. It would
produce a differently coloured square with a hard outline.

## Two axes, and only one of them themes

Colour and style are separate questions, and they want separate answers:

- **Colour** is which values the kit paints with. Every control means the same
  thing by "accent"; a theme changes what accent IS.
- **Style** is the SHAPE of a control — round or square, bordered or raised,
  a sliding knob or a checkbox.

The tempting answer to the second is a kind per style: a `Modern Button` that
acts like `Button` and declares its own `define drawing`. That works — `acts
like` takes the drawing conditionally (`ActorBuilder.actsLike`, `this.drawing
??= other.drawing`) precisely so a child that describes its own picture keeps
it. No new machinery is needed to build one today.

**It still cannot be the theming mechanism**, for three reasons:

1. **`acts like` is not `is a`.** `ActorBuilder` says it outright: a thing
   that acts like a Progress Bar is not one of `any ⟨Progress Bar⟩`. Swapping
   Button for Modern Button kills every `when any ⟨Button⟩ is clicked` hat in
   the project — silently, which is this lab's worst failure mode
   (`specs/BOXES_PLAN.md`, "The election that elected nothing").
2. **Every placement names a kind.** A map with thirty Buttons does not
   restyle; thirty placements get replaced. Switching theme becomes a
   migration.
3. **Stock actors are COPIED into the project.** `importStockActor` writes the
   file into the learner's own `actors/` folder, walking parents and rules as
   it goes. There is no central library to re-theme. An enhancement rewriting
   fifteen `define drawing` rows rewrites the learner's files and overwrites
   whatever they changed — one-shot and destructive, which is what an
   enhancement is.

So a variant kind answers "I want a Modern Button in this project". It does
not answer "theme this app". Both are worth having; only one of them is this.

## A style is a pen preset

The pen is already stateful. `Pen` offers `fill`, `outline`, `noFill`,
`noOutline`, and `paint()` stamps the current values onto each command as it
is pushed (`engine/core/drawing.ts`). A drawing already reads:

    fill ⟨#3050a0⟩
    outline ⟨#ffffff⟩ width ⟨2⟩
    draw rectangle ⟨0,0⟩ ⟨width⟩ by ⟨height⟩

So a style is not a new concept bolted onto the drawing language. It is the
concept that is already there, given a name and a home:

    use style ⟨button face⟩
    draw rectangle ⟨0,0⟩ ⟨width⟩ by ⟨height⟩

`use style` sets several pen fields at once — fill, stroke, stroke width,
corner radius, shadow, and for text the size, weight and colour. Everything
after it draws in that style until something says otherwise, exactly as `fill`
works now.

**A pen block rather than a drawing block.** `fill rectangle using style ⟨…⟩`
was the first shape proposed and it is one block fewer, but it only helps
rectangles: a circle, a line and a paragraph want the same styling and would
each need their own combined form. Setting the pen composes with every shape
there is, and matches what the language already does.

## Two levels, because classes alone are one short

`accent` appears in a Button's face, a Dropdown's selected row, a List's
selected row and a Slider's fill. If each of those is a style holding its own
literal, recolouring means editing four styles — the copy-paste problem moved
up one level, which is not a fix.

So two levels, which is CSS custom properties and classes, arrived at for the
same reason:

- **Tokens** — named values. `accent`, `surface`, `ink`, `radius`, `border`.
- **Styles** — named bundles that reference tokens. `button face` is fill
  `accent`, radius `radius`, shadow `2`.

Recolour by changing tokens. Restyle by changing styles. A theme is a file
holding both.

**This is what a style buys over tokens alone**, and it is the whole argument
for the extra level. With tokens, a Button's drawing still composes the look —
"fill accent, outline accent-edge at border, corner radius" — so the
RELATIONSHIP is hardcoded in the drawing, and a bordered Classic and a
shadowed borderless Modern cannot both come out of it without the drawing
branching. With styles, the drawing says "paint this as a button face" and the
style decides border-versus-shadow. The drawing stops encoding the look.

## Where a theme lives: one file

`styles/<name>.style`, a JSON file authored in an editor of its own, holding
the token values and the named styles together. A world names the one it uses:

    define world ⟨My World⟩
      use theme ⟨styles/modern⟩

One artifact, one editor, one row to swap. The precedent is `.effect`: a JSON
file authored in a custom editor and named from a block by a dropdown sourced
from the project's files (`domainBlocks`, `world_add_effect`,
`effectFileImportOptions`), with a mutator turning its parameters into
sockets. Three non-Blockly editors already exist to copy from — image,
animation, effect.

**A drawing names a style, never a file.** `use style ⟨button face⟩` resolves
against whichever theme the world named. A drawing that named
`modern.style#button face` would have to be edited to change theme, which is
the thing this exists to avoid.

### The alternative, deliberately not taken

Tokens as world properties on a `Theme` FOUNDATION rule, in the shape `Boxed`
took: a rule nothing has to import, its values editable as fields in the world
inspector (`specs/WORLD_RULE_FIELDS_PLAN.md`), readable inside a drawing
because the generator binds `world` there (`(actor, pen, world) => {…}`).

It was the first proposal and it is worse for this, for three reasons. It
needs `rule.color` added to the world-scoped side of the DSL, which today
offers number, angle, point, vector and boolean and no colour
(`scripts/rules/dsl.mjs`). It splits the theme across two artifacts once
styles exist, so a style file would reference a rule's properties by name —
another name that can fail silently. And swapping a theme becomes N property
sets rather than one row.

Its one real advantage is that a world property can be SET while the game
runs, which is how a dark-mode toggle or a UI that flushes red on damage would
work. That is worth having and is not lost: it becomes an override layer over
the file, deferred below.

## The roles, inventoried

Thirty-nine uses collapse to about a dozen names. This is the vocabulary a
stock theme must define in full, and the list every control's drawing is
rewritten against:

| Token           | Today               | Where it is used                  |
| --------------- | ------------------- | --------------------------------- |
| `surface`       | `#202840`           | Panel, Dropdown face, List face   |
| `surface edge`  | `#8890b0`           | the 2px border on nine controls   |
| `well`          | `#10141c`/`#101828` | Scroll View, Viewport, Speech Box |
| `field`         | `#1a1a22`           | Text Input, Text Area             |
| `accent`        | `#3050a0`           | Button face, Slider fill          |
| `accent raised` | `#4050a0`/`#303a58` | Dropdown and List selected rows   |
| `ink`           | `#ffffff`           | words, Toggle and Slider knobs    |
| `muted ink`     | `#6b7394`           | a field's placeholder             |
| `muted`         | `#505870`/`#3b4252` | Toggle off, scrollbar track       |
| `focus`         | `#ffd45e`           | the ring, on five controls        |
| `danger`        | `#e06c75`           | a field that looks wrong          |
| `positive`      | `#40c060`           | a Toggle that is on               |

Plus the shape tokens, which is most of what separates one style from another:

| Token     | Modern | Classic | Terminal |
| --------- | ------ | ------- | -------- |
| `radius`  | 10     | 0       | 0        |
| `border`  | 0      | 2       | 1        |
| `shadow`  | 2      | 0       | 0        |
| `padding` | 8      | 4       | 4        |

The Progress Bar's `#e04040` and `#301820` are deliberately NOT on this list.
A health bar's red is a game's colour, not an interface's, and it is already a
per-instance property a project sets. The Shot's `#ffd23f` is the same: that
is a game actor, and the kit stops at the interface.

## The painter has to grow three things first

None of this shows up without them, and all three are small:

1. **A corner radius on the pen**, carried in `Paint` and read by the
   rectangle command, painted with `ctx.roundRect`. It is native in current
   browsers; the painter's tests use a recording fake context, so it is
   testable without a real canvas. A fallback to `rect()` when it is absent
   keeps an old browser drawing squares rather than nothing.
2. **A shadow on the pen** — `shadowColor`, `shadowBlur`, `shadowOffsetY`,
   three lines in `draw`, cleared after each command so it does not leak.
3. **A text weight**, threaded through `fontAt` so that whatever MEASURES text
   and whatever draws it cannot disagree about the font — which is why that
   function is exported in the first place.

These are worth building whatever happens to styles. They are what actually
makes the kit stop looking cheap.

## The texture cache is free, on one condition

`drawingKey` hashes the command list, and `paint()` stamps CONCRETE values
onto every command. So a style must resolve to values BEFORE the command
reaches the list. Do that, and:

- changing a theme changes the commands, so exactly the affected drawings
  re-rasterize, and
- nine identical buttons still share one texture.

Carry the style NAME into the command instead and two themes produce the same
key, so the cache serves the old picture. That is the obvious implementation
and it is the wrong one; this is the sentence that says so.

## What is deliberately not taken from CSS

- **No cascade, no selectors, no specificity.** Flat named styles, resolved by
  name. Specificity is the most confusing thing in CSS for people who write it
  professionally, and this is a language for people who have not.
- **No inheritance down the parent chain.** Parenting is real here — a Panel
  carries its children (`specs/PARENTING.md`) — and inheriting a text colour
  down it is tempting. It makes "why is my label blue" unanswerable, and the
  children are actors of their own kinds, not markup.
- **No `extends` between styles**, at first. It is the one CSS idea that might
  earn itself later; starting without it costs a little repetition in one file
  that an editor is showing you anyway.
- **No units, no layout.** A style says how a thing is painted. Where it is
  and how big it is are the box and the anchor, which already exist
  (`specs/BOXES_PLAN.md`, `specs/ANCHORS_PLAN.md`).

## The tension to settle before building: what wins

`text color` is a Label's own property, per-instance on purpose so that two
Labels of one kind can differ (`actors/stock/label`). A style carrying a text
colour competes with it directly.

The CSS answer is the right one and is easy to say: **the actor's own property
wins when it is set; the style fills in when it is not** — an inline style
beating a class. But it needs a notion of UNSET, and today every Label carries
an explicit `#ffffff`, so the style would never win once.

Two ways out, and the choice belongs in this spec before any code:

- **A sentinel.** The default becomes an empty colour meaning "whatever the
  style says". Cheap, and adds a value that is not a colour to a colour
  property.
- **Genuinely optional properties.** A colour property with no default, which
  the property system does not have today and which several other things would
  eventually want.

The first is smaller and reversible; the second is more honest. Neither is
free, and picking one is the first decision this plan owes.

## States stay in the drawing, for now

A control has states — pressed, focused, disabled — and CSS spells them
`:hover`. It is tempting to put them in the style.

Keep them in the drawing at first:

    if ⟨this actor is held⟩
      use style ⟨button face pressed⟩
    else
      use style ⟨button face⟩

Which state an actor is in is a question about the ACTOR, and the drawing is
where that is readable — a learner opening `button.actor` can see why it looks
different when pressed. A style that answered it would move the reason
somewhere the drawing does not mention. If the branching turns out to be noisy
across fifteen controls, style-side states can come later; they cannot be
taken back.

**AND THE PRESSED STATE IS NOT FREE, which this said it was.** The claim was
that `Can Be Clicked` tracks held and the Slider reads it. It does not: the
Mouse rule offers a targeted CLICK and no targeted press, because a press is
announced to every actor with `Takes Mouse Input` whether the pointer is over
it or not. What knows is the GESTURES rule, whose `Takes Gestures` trait
carries a read-only `being pressed` — which is exactly why the Slider stopped
keeping a `held` boolean of its own.

So a Button that looks pressed elects Gestures, and importing a Button then
pulls that rule. Gestures is granted at `story/form` today and Buttons arrive
at `story/choice`, so this is a curriculum change as well as a visual one, and
it is not made here.

## What gets built, in order

1. **The painter.** Corner radius, shadow, text weight, on the pen and in the
   drawing vocabulary. Nothing else depends on a decision.
2. **The kit, redrawn against them.** Corners, most outlines dropped for
   elevation, and a focus ring that follows the corner. `RING_INSET` becomes
   one exported constant. This is the step that makes them look professional,
   and it is worth doing whether or not step 4 ever happens. The pressed state
   is NOT in it, for the reason above.
3. **The style file and the `use style` block — BUILT.** Stock
   `modern.style` and `classic.style`, the full role vocabulary in each, a
   `use theme` row on the world, and every control moved. See below for the
   two things it settled that this plan had left open.
4. **The editor.** A surface for editing tokens and styles with a live
   preview of each control. The `.effect` editor is the shape.

Steps 1 and 2 are worth having alone. If 3 and 4 never earn themselves, the
kit still looks right; it just takes editing drawings to restyle.

## What step three settled

- **The literals stayed, under the styles.** Every control says its own look
  and then says `use style`, in that order. A style the active theme does not
  define leaves the pen exactly as it was, so the rows above are the picture a
  project with NO theme gets — which is every project that existed before
  themes did, drawn exactly as it was. It costs one row per control and a pair
  of colours stated twice. It buys: nothing breaks, the default is visible in
  the file a learner opens rather than hidden in the engine, and the literals
  can be deleted the day a theme is guaranteed.
- **Ordering IS the answer to "what wins".** The tension below — a style's
  colour against a per-instance property — needed no sentinel and no optional
  property after all. The Progress Bar says `use style ⟨bar track⟩` and THEN
  `fill ⟨track color⟩`, so the theme decides the corner of every bar in the
  project and each bar keeps the colours its own properties hold. The pen is
  ambient and ordered; that was already the mechanism.
- **A role vocabulary of eighteen, pinned both ways.** `stockStyles.test`
  checks that each theme defines every role AND no others: a missing role is a
  control painted in whatever the pen last held, an extra one is a role
  somebody meant to draw with and a `use style` somebody forgot to write.
- **`well` and `floating` are two roles, not one.** A Viewport and a Speech
  Box are the same dark recess and only one of them is in front of the scene.
  That distinction is the one thing colour alone could not carry.
- **The reader needed the theme too.** `preview/drawingReader` finds it the
  way the game does — the first `use theme` row under a `define world` — and
  applies a style with the same absent-leaves-alone rule. A still and the live
  picture have to be wrong in the same way, or they are two pictures.
- **Two guards earned themselves on the way in, neither of them this plan's.**
  `shelfCoverage` caught `world_use_theme` sitting in the gated World drawer
  with no tile granting it — a block that would have shipped reachable by
  nobody. (`use style` needed no grant: it is a pen block and arrives with the
  Drawing drawer at `look/drawing`.) And `builderSurface` caught `useTheme`
  existing on the live World and not on `WorldBuilder`, which is where a row
  under `define world` actually runs — so `use theme` would have thrown on
  every world that used it, at build time, before anything drew.

## What it does not do

- **No editor.** A theme is JSON a learner edits as text. Step 4.
- **No runtime theme change.** The theme is a file a world names, resolved at
  load. A dark-mode toggle and a UI that flushes red on damage both want `set
⟨accent⟩ to ⟨…⟩` while the game runs, which is the override layer the
  rejected alternative would have given for free. It is the first thing to add
  if anybody asks.
- **No per-actor theme.** One world, one theme. A settings screen in a
  different skin is not answered.
- **No gradients.** Flat fills with elevation, which is what current interface
  design does anyway and what the painter can reach without a new command.
- **Nothing for game actors.** The Progress Bar's red and the Shot's yellow
  stay literal. The kit stops at the interface.
- **No style for the map editor's own chrome**, which is React and CSS and has
  nothing to do with this.
- **No pressed state**, which wants the Gestures rule and therefore a
  curriculum decision. See above.

## What building the painter and the redraw found

- **The reader is a second implementation of the pen.** `preview/drawingReader`
  makes the map editor's stills without running a game, and it did not know
  the three new blocks — so the Button's still went INCOMPLETE, and an
  incomplete reading falls back to the sandbox's picture. One assertion
  noticed, naming one kind. The test now names every kind that can be read and
  every kind that cannot, so the next pen block says which it broke.
- **`set fill ⟨r g b a⟩` drew in the previous colour.** The two colour blocks
  disagree on purpose — a picker answers `'#rrggbb'` and `r g b a` answers
  four floats, so that reaching past the swatch keeps an alpha — and the pen
  passed whichever arrived straight to `fillStyle`, where an array is not a
  colour and a canvas keeps what it had. Settled at the pen now
  (`core/color.cssColor`), which is also what let a shadow have an alpha at
  all. A hex string passes through untouched: rewriting every swatch as
  `rgba(…)` would re-rasterize every picture in the lab to say the same thing
  differently.
- **A `.style` file cannot hold a colour a `colour_picker` cannot.** The swatch
  field speaks six digits. That is fine for every token but the shadow, which
  is written as `r g b a` — and it is a reason the style file should hold its
  tokens as values of its own rather than as swatch fields.

## Obligations

- Every stock theme defines the FULL role vocabulary, pinned by a test that
  reads the table above. A drawing naming a role the active theme lacks is
  exactly the silent-name failure this lab keeps meeting
  (`specs/BOXES_PLAN.md`), so the resolution falls back to a visible default
  and the editor reports it rather than drawing nothing.
- `use style` takes a DROPDOWN sourced from the active theme, never free text,
  for the same reason.
- The style resolves to values before the command list — see above — with a
  test that two themes over one drawing produce two different `drawingKey`s.
- `RING_INSET` and `RING_WIDTH` are exported once, not declared five times.
- The map editor renders drawings for its previews and inspector pictures, so
  it follows the theme with no work. Check it does.
