# Plan: styles, tokens, and an interface that looks like one

STATUS: BUILT, and reshaped once after it was. The four steps below are done;
the section "Reshaped: classes, and a file that cascades" is what a first
use of it found and is the shape that now stands. The rest is kept as the
working record — the arguments are still the arguments.

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
pulls that rule. Gestures was granted at `story/form` and Buttons arrive at
`story/choice`, so this was a curriculum change as well as a visual one.

_It has since been made._ The grant moved to `story/choice` — see "Reshaped",
below, where the pressed state is built. Everything in this section stands;
only the last sentence of it was overtaken.

## What gets built, in order

1. **The painter.** Corner radius, shadow, text weight, on the pen and in the
   drawing vocabulary. Nothing else depends on a decision.
2. **The kit, redrawn against them.** Corners, most outlines dropped for
   elevation, and a focus ring that follows the corner. `RING_INSET` becomes
   one exported constant. This is the step that makes them look professional,
   and it is worth doing whether or not step 4 ever happens. The pressed
   state was not in it, for the reason above; it arrived with the reshape.
3. **The style file and the `use style` block — BUILT.** Stock
   `modern.style` and `classic.style`, the full role vocabulary in each, a
   `use theme` row on the world, and every control moved. See below for the
   two things it settled that this plan had left open.
4. **The editor — BUILT.** A surface for editing tokens and styles with a
   live preview of each control, on the `.effect` editor's seam.

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

## What the editor turned out to be

`.style` joins `.rule`, `.actor`, `.map`, `.anim` and `.effect` on Codebridge's
`editorComponents` seam, so a theme persists through the same file `onChange`
as any text file. Two panels, because a theme has two levels: a list of
VALUES, and a list of BUNDLES that point at them.

**The preview draws the real controls.** Not a mock-up of a button — the stock
Button's own `.actor` file, read by `preview/drawingReader`, which is the
reader that makes the map editor's stills, painted by `paintDrawing`, which is
the painter that makes the game's textures. The only thing that differs
between the preview and the game is which canvas it lands on, so a theme that
looks right here looks right there. What has to be invented is the PROJECT
around it, because the reader finds a theme the way the game does — the first
`use theme` row under a `define world` — and the file being edited has no path
yet. `editor/previewFiles` makes a world whose only row names it.

**It cannot add a style, and that is not an omission.** A style nothing names
does nothing: a drawing has to say `use style ⟨…⟩` for a role to exist at all,
and that is a block in an `.actor` file. A "new style" button would make a
thing whose only effect is to be unused and would say nothing about where to
go next. Adding a TOKEN is the same argument one level down. So the editor
edits what the file already holds.

**A field has four answers, not two.** Leave alone, none, a token, or a value
of its own. The first two are the distinction the whole compose story rests
on — absent leaves the pen as it was, null clears it — and a form that offered
only "set it to something" could not have written either.

**A `page` token was added to both themes.** No style names it and no control
paints it: a world paints its own background. But a theme that expects a dark
page and one that expects a light page both look wrong on the other's, and
neither could say so in a style — so the preview would have had to guess.

## Reshaped: classes, and a file that cascades

Everything above was built and then reshaped, because the first cut named its
styles after COMPONENTS — `button face`, `button caption`, `menu`, `chosen
row`. That is eighteen names for six ideas, and it has two consequences that
only show up once somebody uses it:

- **The vocabulary grows with the kit.** Every new control needs its own
  `⟨thing⟩ face` and `⟨thing⟩ caption`, and every theme has to define them
  before that control can be drawn at all.
- **There is no way to say "this one button is the dangerous one."** The
  drawing names one style, so every Button in the project draws the same. A
  variant needed a second KIND, which breaks `any ⟨Button⟩` — the thing this
  whole plan exists to avoid.

### One axis, three levels

- A `.style` file defines named CLASSES. A class is a set of paint properties.
- A drawing says `use style ⟨class name⟩` and nothing else. It never names a
  file, and it never knows which theme it is being drawn under.
- **Which file is in play cascades**: the main world sets the base, a map may
  override it, a placement may override that.

So `use style` answers "what is this shape FOR" and the cascade answers "what
does that look like here". A danger button is a placement pointed at a file
that says a button is red; nothing about the Button's kind, its drawing or its
handlers changes, and `any ⟨Button⟩` still finds it.

Each level has a home that already exists:

| Level | Where it is set                                        | Precedent                                        |
| ----- | ------------------------------------------------------ | ------------------------------------------------ |
| World | `use theme ⟨styles/modern⟩` under `define world`       | built above                                      |
| Map   | `theme` on the map document, a field in the map editor | `MapDoc.modal`, a map-level flag with a tick box |
| Actor | `theme` on the `Has a Style` trait, in the inspector   | `Has a Box`, elected by the same nine kinds      |

Resolution is the actor's own, else the theme of the map that PLACED it, else
the world's. The engine already knows the middle one: `World.loadOf` is a
`WeakMap<Actor, MapLoad>` kept so that `canReach` can ask which load an actor
belongs to (specs/MODALITY_PLAN.md), and a load is made from a map document.

### A class name is a string, deliberately

`use style` offers a dropdown of what the project's files define AND takes
what is typed, so `use style ⟨my fancy button⟩` is a thing a learner can
invent and then define. That is a retreat from "a dropdown, never free text"
and it is a smaller one than it looks: the failure that rule guards against is
a name resolving to nothing, and a class that resolves to nothing leaves the
pen exactly as it was — the control is drawn in whatever came before rather
than vanishing, and the theme keeps the name.

No enum property type is added. An actor's own properties have no closed-set
type (`blockly/ruleMeta`, PROPERTY_TYPES) and this does not need one: the
class lives in a block FIELD, which already has a dropdown, and the theme
lives in a string property the inspector special-cases. An enum property is
worth having the day a second property wants one.

### A file may extend another

The moment a placement can point at its own file, a file that defines only
what differs is the obvious thing to want — and without help it does not work:
a class the file does not define leaves the pen alone, so a `danger.style`
holding one class would draw the rest of the control in whatever came before.
The alternative is that every variant is a full copy of the base, which drifts
the moment the base changes. That is the copy-paste problem again, at the
scale of a file.

So a file may name one parent:

    {"name": "Danger", "extends": "styles/modern",
     "styles": {"button": {"fill": "$danger"}}}

**This is not the cascade this document refused.** There are no selectors, no
specificity and no walking a chain of actors: one named parent, merged once
when the theme is loaded, class by class and then field by field. A file that
names none stands alone. It is the same shape as `acts like` for an actor and
`requires` for a rule, both of which this lab already has, and it is resolved
the same way — at load, once, with a cycle guarded rather than followed.

### The classes

Named for what a thing IS rather than for which control it belongs to, which
is what lets one name serve six kinds:

| Class        | What wears it                                           |
| ------------ | ------------------------------------------------------- |
| `button`     | a control you press                                     |
| `surface`    | a sheet things sit on — Panel, Dropdown face, List face |
| `inset`      | a recess things sit in — Viewport, Scroll View          |
| `floating`   | a sheet over the page — Speech Box, an open menu        |
| `field`      | something typed into                                    |
| `caption`    | the words on a control                                  |
| `hint`       | words that are a prompt rather than an answer           |
| `ring`       | the focus ring                                          |
| `track`      | a groove — a bar's, a scrollbar's                       |
| `bar`        | the filled part of one                                  |
| `knob`       | the piece that slides                                   |
| `chosen`     | the row a click would take                              |
| `pointed`    | the row under the pointer                               |
| `on` / `off` | a switch's track                                        |
| `wrong`      | a field that failed                                     |
| `pressed`    | a control being held                                    |

`caption` is the one worth arguing about, because a Button's words and a
Panel's title look different in the first cut and the same here. They can be
the same: within one theme every surface is light or every surface is dark, so
one ink serves both. Where a theme genuinely wants two, it defines a second
class and the drawing names it — which is the escape hatch, not the default.

**`pressed` is read by the Button**, and the curriculum decision it was
waiting on was made: the Gestures grant moved from `story/form` to
`story/choice`, which is where the first control you press arrives.

That pairing was right for what Gestures ANSWERS — a Slider is the control
that cares most about the middle of a press — and wrong for when it is first
NEEDED. A Button that does not look pressed while you hold it is the plainest
thing this kit was missing, and `being pressed` is the only per-actor answer
to "am I the one being held": the Mouse rule raises a targeted CLICK and no
targeted press, because a press is announced to every actor with `Takes Mouse
Input` whether the pointer is over it or not.

**It is also the clearest demonstration of why a style field has three states
rather than two.** Modern's `pressed` NAMES a lifted fill, says `null` to the
shadow — so a raised button sinks into the page while it is held — and says
NOTHING about the corner, which therefore survives from the face. Mention,
clear, and leave alone, in one four-line class.

**The Toggle does not take it**, though it acts like a Button and so carries
`Takes Gestures` along with everything else. `pressed` says a FILL, and a
switch's track fill is the whole of what `on` and `off` mean — a switch that
looked the same pressed as it does off would be saying the wrong thing rather
than an extra thing. Press feedback on a switch wants a class of its own, and
nobody has asked.

### And the caption bug, fixed at the pen

`text color` is a per-instance property defaulting to `#ffffff`, so the row
that reads it overrode whatever the class set and Classic's dark caption never
landed — a white caption on a light grey face. Ordering answered this for the
Progress Bar, where the learner's `bar color` SHOULD win; it is wrong here,
because `#ffffff` is not a choice anybody made.

An UNSET COLOUR NOW LEAVES THE PEN ALONE. `text color` defaults to empty, and
`pen.fill('')` keeps whatever the pen was carrying — which is the same
absent-leaves-alone rule a style field already follows, one level down. No
branch per control, and the no-theme case is unchanged, because the pen's own
default fill is `#ffffff`, exactly what the property's default was. Every text
row is preceded by a `use style`, so there is always a class-provided fill
underneath it for the empty case to fall through to.

## The palette, renamed

The colour names were the kit's own, lifted out of the drawings and left as
they were found: `surface`, `surface edge`, `surface raised`, `well`, `muted`,
`muted ink`, `page`. Six words for what is really two families with a quiet
end and a loud one, plus one — `well` — that said nothing to anybody who had
not written it.

| was              | is               |                                                    |
| ---------------- | ---------------- | -------------------------------------------------- |
| `page`           | `background`     | what the controls are read against                 |
| `surface`        | `primary`        | the main surface                                   |
| `surface raised` | `primary light`  | a gentle lift — the row under a pointer            |
| `surface edge`   | `primary strong` | the end with contrast; borders live here           |
| `muted`          | `secondary`      | the quiet furniture — tracks, a switch that is off |
| `accent raised`  | `accent light`   | the chosen row, a button held down                 |
| `muted ink`      | `ink light`      | a placeholder                                      |
| `well`           | —                | folded into `field`                                |
| —                | `warning`        | new, and read by nothing                           |

**`light` and `strong` are said RELATIVE TO THE SURFACE**, not as absolute
lightness, and that is what lets one pair of names serve both themes: on
Modern the strong end is lighter than the panel and on Classic it is darker,
and in both it is the end with contrast enough to be a border. A name that
meant "lighter" would have been wrong in one of the two files.

**`well` folded into `field`, not into `background`**, which was the first
guess and was wrong: a Classic desktop is `#8a8a82` and a Classic text area is
`#ffffff`, so those two cannot be one token. Against `field` the difference is
a few points in both themes — `#f4f2ee` against `#ffffff`, `#10141c` against
`#1a1a22` — which is exactly the drift this exercise exists to remove. What
`well` MEANT is the inside of anything that holds content: a field's words, a
scroll view's rows, a viewport's map. The class keeps the idea under a name
that says it, `inset`.

**`warning` is a token nothing reads.** A palette with a danger and a positive
and no warning is one a theme author has to extend before they can say an
ordinary thing, and a token costs a line and no behaviour. That is not the
argument that keeps unused CLASSES out — a class nothing names does nothing
visible, where a token is a value waiting to be referred to.

## What opening it found

Two things, both of which needed somebody to actually run it.

**Every caption was invisible in a project with no theme.** The reshape put
`use style ⟨caption⟩` in front of every text row and took the literal away,
on the reasoning that the class would supply the fill. It does — when there is
a theme. A class no theme defines LEAVES THE PEN ALONE, so with no theme the
words inherited whatever the FACE had just set, and a Button drew `#3050a0`
on `#3050a0`. The Label was fine and hid the bug, because a Label paints
nothing before its words.

This is the pattern every other row in the kit follows and the caption was the
one that did not: say your own look, then offer to be overruled. The ink is a
literal again, under the class. `drawingReader.test` now asserts that no
control draws its words in the colour of what they sit on, with no theme and
with both — the failure only shows up in the case a theme papers over.

**There was no way to get a first theme.** A project starts with none, so
every dropdown that offers one starts empty, and an empty menu says nothing
about where a theme comes from. The `use theme` block had an `(import…)` row;
nothing else did. Now the map's theme field, a placement's theme field and the
file browser all reach the same seam, and the browser has a Themes section
with **New theme** beside it — which seeds a copy of Modern rather than an
empty document, for the same reason a new `.effect` is a passthrough graph: a
theme defining no classes changes nothing and gives a learner nothing to edit.

**And the Interface Kit fixture ships with both themes and names one.** It is
the demonstration, and a demonstration of theming with no theme in it was
asking the reader to imagine the entire point.

And a third, reported after the other two were fixed: **changing or
overriding a theme did nothing.** `use theme` generated `world.useTheme(mod)`
with one argument, so the world was never given a way to find a theme BY PATH
— and all three of the things that need one are paths in data rather than
imports: a file's `extends`, a map's `theme` field, and a placement's
property. Every one of them fell through to the base, silently, which is
exactly what "does not seem to work" looks like from outside.

The world preamble now imports every `.style` the project holds and registers
it with `defineTheme`, which is the same answer `world.define` is for actor
kinds and `defineMap` is for maps, reached for the same reason: a path that
arrives as DATA is a path no bundler could have followed. `interfaceKitPlays`
now takes all three levels and `extends` through the compiler, which is the
only test in the repo that walks the whole path.

That first change found the worst of the three, which nothing else could
have:
**`use theme` had never worked outside a test.** The block generates an import
of the `.style` file, and neither the bundler (`runtime/compile/
virtualFsPlugin`) nor the test compiler knew the extension — so the import
resolved to nothing and reading `default` of it threw. Every test passed the
whole time, because no test had ever compiled a project that NAMED a theme:
the reader tests read files directly, and the engine tests call `useTheme`
with a document in hand. The fixture is the first thing in the repo to take
the whole path, and it took it on its first run.

## What it does not do

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
