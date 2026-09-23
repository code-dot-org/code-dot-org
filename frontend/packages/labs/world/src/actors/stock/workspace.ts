// Building a stock `.actor` file, which is an ordinary Blockly workspace.
//
// The stock RULES are generated from `scripts/rules/*.mjs`, because a rule runs
// to hundreds of blocks and hand-written JSON at that size is unreadable and
// unmaintainable. These are two dozen, so they are written here directly — with
// helpers for the two shapes that would otherwise be a wall of nested `next`.
//
// Nothing about a stock actor is privileged. It is a file a learner opens and
// reads, and the first thing they read is that a Label is an actor that elects
// one trait and draws one thing (specs/UI_ACTORS.md).

import {pascal, STARTS_EMPTY} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import {MAIN_WORLD_PATH} from '../../mainWorld';

/**
 * Where a stock actor's handlers sit: a column to the right of its definition,
 * and how far apart they are down it.
 *
 * GENEROUS ON PURPOSE. Both are guesses — a block's real height is the
 * renderer's to know and no file can ask — so they are picked to be too big
 * rather than nearly right: blocks that do not overlap are never tidied, and a
 * gap that is too wide costs a reader one scroll where one that is too narrow
 * costs them the layout being rearranged under them.
 */
const HANDLER_COLUMN = 560;
const HANDLER_GAP = 220;

/** Chain statement blocks, first at the top. */
export const chain = (blocks: object[]): object =>
  blocks.reduceRight((next, block) => ({...block, next: {block: next}}));

/** `use trait ⟨Rule#Trait⟩` — how an actor takes a share of a rule. */
export const useTrait = (trait: string) => ({
  type: 'world_use_trait',
  fields: {TRAIT: trait},
});

/**
 * `show as ⟨icon⟩` — the symbol a picker draws this kind with.
 *
 * Every stock interface actor wants one, because every one of them looks like
 * whatever this instance happens to say: at 24 pixels in a dropdown a Label and
 * a Button are the same smudge, and there is no name beside it
 * (specs/UI_ACTORS.md).
 */
/**
 * `acts like ⟨actors/progressBar⟩` — be everything another kind is.
 *
 * The traits, the property slots, the per-frame work and the picture come
 * across; the KIND does not, so `any ⟨Progress Bar⟩` still means the Progress
 * Bars (`ActorBuilder.actsLike`). The actor named has to be a file the project
 * holds, which is what a shelf entry's `actors` brings.
 */
/**
 * `is data` — this kind is a RECORD, with fields and nowhere to be.
 *
 * Not drawn, in no search over places, hit-tested by nothing; still has its
 * properties, its events and its place in `all actors`
 * (specs/RECORDS_PLAN.md).
 */
export const isData = () => ({type: 'world_actor_is_data'});

export const actsLike = (path: string) => ({
  type: 'world_acts_like',
  fields: {ACTOR: path},
});

export const showAs = (icon: string) => ({
  type: 'world_show_as',
  fields: {ICON: icon},
});

/** `this actor`, as a socket's contents. */
export const me = () => ({block: {type: 'world_this_actor'}});

/** A number socket's default. */
export const num = (value: number) => ({
  shadow: {type: 'math_number', fields: {NUM: value}},
});

/** A color socket's default — a swatch, which is what a color block is. */
export const swatch = (color: string) => ({
  shadow: {type: 'colour_picker', fields: {COLOUR: color}},
});

/** A word socket's default. */
export const words = (text: string) => ({
  shadow: {type: 'text', fields: {TEXT: text}},
});

/**
 * Who owns the four text properties, as a block-type segment.
 *
 * They were the Writing rule's — a rule with four properties and no behavior,
 * which is a file and a shelf row standing between a learner and four
 * declarations they can read in the actor that draws them. They are the
 * LABEL's now, and everything that shows words either acts like a Label or
 * declares its own (specs/UI_ACTORS.md).
 *
 * An actor that declares its own — a project with no Label to act like —
 * keys them by its own file, which is what the `own` argument carries
 * (`blockly/ownProperties`).
 */
export const LABEL_OWNER = 'ActorsLabel';

/** `⟨name⟩ of this actor`, for one of the four a Label declares. */
export const textOf = (exportName: string, own: string = LABEL_OWNER) => ({
  block: {type: `world_get_${own}_${exportName}`, inputs: {ACTOR: me()}},
});

/** `set ⟨name⟩ of this actor to ⟨value⟩`, for one of the same four. */
export const setText = (
  exportName: string,
  value: object,
  own: string = LABEL_OWNER,
) => ({
  type: `world_set_${own}_${exportName}`,
  inputs: {ACTOR: me(), VALUE: value},
});

/** `set sprite ⟨file⟩` — a still picture, named by its file. */
export const setSprite = (file: string) => ({
  type: 'world_set_sprite',
  fields: {SPRITE: file},
});

/**
 * `when this actor presses ⟨key⟩` — a key binding the actor owns.
 *
 * The TRAIT's event, not the world's. A world event is handed no actor and
 * registers on the world, which an `.actor` module has no binding for; "this
 * actor presses space" is the statement an actor can make. Electing
 * `Input#TakesKeyboardInput` is what makes the broadcast reach it.
 */
export const onKey = (key: string, body: object[]) => ({
  type: 'world_on_Input_PressesEvent',
  fields: {FILTER0: key},
  ...(body.length ? {next: {block: chain(body)}} : {}),
});

/**
 * `play animation ⟨id⟩` — the picture, for an actor that has one.
 *
 * The id is the animation's own key inside its `.anim` file, which is not
 * always the file's stem: the stock "switch" animation holds "switchFlip".
 * `importStockAnimation` returns the key it registered, so an actor and its
 * import can be checked against each other rather than trusted to agree.
 */
export const playAnimation = (id: string) => ({
  type: 'world_play_animation',
  fields: {ANIMATION: id},
});

/**
 * `define ⟨type⟩ ⟨property⟩ ⟨name⟩ with default ⟨value⟩` — state this KIND keeps.
 *
 * The same block a rule and a trait declare with; where it sits decides whose
 * it is (`blockly/ownProperties`). READ-ONLY means the declaring file owns the
 * value: the setter is offered inside this `.actor` and nowhere else, which is
 * what a count some handler of the actor's own advances wants.
 */
export const defineProperty = (
  type: string,
  name: string,
  value?: string,
  opts: {readonly?: boolean} = {},
) => ({
  type: 'world_rule_property',
  fields: {
    TYPE: type,
    ACCESS: opts.readonly ? 'readonly' : 'writable',
    NAME: name,
    // NOT FOR A TYPE THAT STARTS EMPTY. The block offers no default field for
    // those, so a file that writes one is writing a field the block does not
    // have: Blockly says "Ignoring non-existant field DEFAULT" and drops it
    // (`ruleMeta.STARTS_EMPTY`). The List and the Dropdown both did, and the
    // warning is what made a real bug beside it hard to read.
    ...(value === undefined || STARTS_EMPTY.has(type) ? {} : {DEFAULT: value}),
  },
});

/**
 * `define event` — something that HAPPENS to this kind.
 *
 * The words are the hat it makes: `finishes revealing` becomes
 * `when ⟨…⟩ finishes revealing`.
 *
 * A part is either wording or a VALUE THE EVENT CARRIES. It could only be
 * wording until an event could carry more than one unnamed thing
 * (specs/EVENT_VALUES_PLAN.md); a carried value is named and typed, the hat
 * says its name, and a handler reads it with the ordinary getter for that
 * name. A parameter is a workspace variable like a `define block`'s, so its
 * id has to be in the file's `variables` as well (`ActorExtras`).
 */
export const defineEvent = (...parts: Array<string | BlockParam>) => ({
  type: 'world_rule_event',
  extraState: {
    parts: parts.map(part =>
      typeof part === 'string'
        ? {kind: 'label', text: part}
        : {kind: 'param', name: part.name, type: part.type, var: part.id},
    ),
  },
});

/** A `define block` parameter: a workspace variable the body reads. */
export interface BlockParam {
  /** The variable's id, unique within the file. */
  id: string;
  /** What it is called on the block's face and in the body. */
  name: string;
  /** The parameter's type — `string`, `number`, `actor`, … */
  type: string;
  /** The variable type that carries it, which is Blockly's own name for it. */
  binds: 'String' | 'Number' | 'Boolean' | 'Actor' | 'Vector';
}

/** `⟨name⟩`, as the body reads a parameter. */
export const paramValue = (param: BlockParam) => ({
  block: {
    type: `variables_get_${param.binds}`,
    fields: {VAR: {id: param.id, name: param.name}},
  },
});

/**
 * `define block` — a named thing this kind does, and the blocks it runs.
 *
 * Statements only: the form that REPORTS a value wants a `defineQuery` beside
 * `defineAction`, which does not exist yet (`ownProperties.designedBlock`).
 */
export const defineBlock = (spec: {
  /** The block's face, in order: words, and the parameters between them. */
  say: ReadonlyArray<string | BlockParam>;
  /** The sentence somebody reads on hovering it months later. */
  description: string;
  /**
   * Shut the eye: this kind's own work, offered in no other file's toolbox.
   *
   * `keep the caret in view` means nothing outside the file that knows what a
   * caret is, and a block a reader cannot mean anything by is one they should
   * not be shown (`extensions/blockVisibility`).
   */
  private?: boolean;
  body: object[];
}) => ({
  type: 'world_rule_block',
  fields: {
    RETURNS: 'none',
    DESCRIPTION: spec.description,
    ACCESS: spec.private ? 'private' : 'shared',
  },
  extraState: {
    parts: spec.say.map(part =>
      typeof part === 'string'
        ? {kind: 'label', text: part}
        : {kind: 'param', type: part.type, var: part.id, name: part.name},
    ),
  },
  inputs: {DO: {block: chain(spec.body)}},
});

/**
 * `define drawing ⟨w⟩ by ⟨h⟩` — the row that says what a kind looks like.
 *
 * The size is SOCKETS rather than fields (`domainBlocks.worldDefineDrawing`),
 * so a fixed one is a number shadow in each and an interface actor may plug in
 * `⟨width⟩ of ⟨this actor⟩` instead. Written once here because every stock
 * actor, fixture and lesson that draws emits the same row, and a shape spelled
 * out in eight places is eight places to fix.
 */
export const drawingRow = (drawing: {
  width: number | object;
  height: number | object;
  commands: object[];
}) => ({
  type: 'world_define_drawing',
  inputs: {
    WIDTH:
      typeof drawing.width === 'number' ? num(drawing.width) : drawing.width,
    HEIGHT:
      typeof drawing.height === 'number' ? num(drawing.height) : drawing.height,
    DO: {block: chain(drawing.commands)},
  },
});

/** What an actor file may hold beside its `define actor`. */
export interface ActorExtras {
  /**
   * The picture it paints, for an actor that has no sprite.
   *
   * Only an interface actor needs one. A Label has no picture and must paint
   * itself; a Coin has a picture and must not, since a drawing would cover it.
   */
  drawing?: {
    width: number | object;
    height: number | object;
    commands: object[];
  };
  /**
   * Event handlers — `when this actor presses ⟨space⟩` and the like.
   *
   * A hat is a root of its own, so these sit beside the definition. They are
   * for what the actor does to ITSELF: a Player binds the space bar because
   * a control scheme is what a player is. What it does to other actors is the
   * project's, and belongs in the world.
   */
  handlers?: object[];
  /**
   * The workspace's variables, which a `define block`'s parameters are.
   *
   * Blockly resolves a variable by ID and treats the name on a block as a
   * hint, so a file using one that is not declared here loads with an empty
   * field — the same bargain `scripts/rules/dsl` states for a rule.
   */
  variables?: ReadonlyArray<{id: string; name: string; type: string}>;
}

/**
 * A stock actor's file: the definition, and whatever sits beside it.
 *
 * A HANDLER IS A SEPARATE ROOT; THE DRAWING IS NOT. A hat takes no previous
 * connection, and `DisableOrphansPlugin` disables a top-level block that has
 * one along with everything below it — so a handler sits beside the `define
 * actor` rather than in it.
 *
 * `each frame` and `define drawing` were both roots here for that reason and
 * are both rows now (`domainBlocks`): the reason a hat cannot chain does not
 * apply to a block that takes a previous connection quite happily, and one
 * shape per block is worth more than the layout was.
 *
 * An actor with neither is a `define actor` alone, which is the same one root
 * the starter project's own actors are — and byte-for-byte the same JSON, so
 * the two can be the same file (see `constants.ts`).
 */
export const actorFile = (
  name: string,
  rows: object[],
  extras: ActorExtras = {},
): string =>
  JSON.stringify(
    {
      blocks: {
        blocks: [
          {
            type: 'world_actor',
            x: 20,
            y: 20,
            fields: {NAME: name},
            // The drawing is the LAST ROW of the definition, after whatever the
            // actor declares. It used to be a root beside it; it is a row like
            // `each frame` and `define block` now, with the pen behind its own
            // pencil (specs/DRAWING.md).
            ...(rows.length || extras.drawing
              ? {
                  next: {
                    block: chain([
                      ...rows,
                      ...(extras.drawing ? [drawingRow(extras.drawing)] : []),
                    ]),
                  },
                }
              : {}),
          },
          // The handlers, in a COLUMN OF THEIR OWN beside the definition.
          //
          // They used to start at y=180 under it, which is a guess about how
          // tall a `define actor` stack is — true of a small actor and wildly
          // wrong for one with a big `define drawing`, where the first handler
          // began INSIDE the definition and the rest overlapped each other at
          // 120 apart. Blockly tidies what overlaps, every tidy is a
          // `BLOCK_MOVE`, and a move used to be saved: opening the Text Area
          // rewrote it, dirtied the project and RESTARTED the running world,
          // for a layout nobody asked for (`BlocklyFileEditor.movedItself`).
          //
          // A second column cannot be wrong later. The definition may grow to
          // any height without reaching the handlers, and the handlers keep
          // their reading order down the page — which is what a learner
          // opening the file meets first, and the reason they were in one
          // column to begin with.
          ...(extras.handlers ?? []).map((handler, index) => ({
            ...handler,
            x: HANDLER_COLUMN,
            y: 20 + index * HANDLER_GAP,
          })),
        ],
      },
      ...(extras.variables?.length ? {variables: extras.variables} : {}),
    },
    null,
    2,
  );

/** `set fill ⟨color⟩`. */
export const fill = (color: object) => ({
  type: 'world_pen_fill',
  inputs: {COLOR: color},
});

/** `set outline ⟨color⟩ width ⟨n⟩`. */
export const outline = (color: object, width: number) => ({
  type: 'world_pen_outline',
  inputs: {COLOR: color, WIDTH: num(width)},
});

/** `no outline`. */
export const noOutline = () => ({type: 'world_pen_no_outline'});

/** `no fill` — for a shape that is an outline and nothing else, like a ring. */
export const noFill = () => ({type: 'world_pen_no_fill'});

/** `round corners by ⟨n⟩`. Zero is square, and there is no block for that. */
export const corner = (radius: number | object) => ({
  type: 'world_pen_corner',
  inputs: {RADIUS: typeof radius === 'number' ? num(radius) : radius},
});

/**
 * A colour with an alpha, as the `r g b a` block.
 *
 * NOT `swatch`, which is a `colour_picker` and speaks `#rrggbb` — six digits,
 * no alpha. A shadow is the first thing in this kit that needs one: an opaque
 * black under a control on a dark page is a hole, not a shadow. `r g b a` is
 * the block that exists for exactly this and it opens as four sliders, which
 * is also the right thing to hand somebody who wants a softer one.
 */
export const rgbaColor = (r: number, g: number, b: number, a: number) => ({
  block: {
    type: 'world_rgba',
    inputs: {
      R: num(r),
      G: num(g),
      B: num(b),
      A: num(a),
    },
  },
});

/** `shadow ⟨color⟩ blur ⟨n⟩ down ⟨n⟩` — what lifts a control off the page. */
export const shadow = (cast: {
  color: readonly [number, number, number, number];
  blur: number;
  down: number;
}) => ({
  type: 'world_pen_shadow',
  inputs: {
    COLOR: rgbaColor(...cast.color),
    BLUR: num(cast.blur),
    DOWN: num(cast.down),
  },
});

/** `no shadow`. */
export const noShadow = () => ({type: 'world_pen_no_shadow'});

/**
 * `use style ⟨button face⟩` — everything the theme says, at once.
 *
 * WRITTEN AFTER THE LITERALS, everywhere in this kit, and that is deliberate.
 * A style the active theme does not define leaves the pen exactly as it was
 * (`CommandPen.useStyle`), so the rows above this one are the picture a
 * project with NO theme gets — which is every project that existed before
 * themes did, drawn exactly as it was.
 *
 * So each control says its own look and then offers to be overruled. It costs
 * one row and a pair of colours that are stated twice; what it buys is that
 * nothing breaks, that the default is visible in the file a learner opens
 * rather than hidden in the engine, and that the literals can be deleted the
 * day a theme is guaranteed (specs/STYLES_PLAN.md).
 */
export const useStyle = (name: string) => ({
  type: 'world_pen_style',
  fields: {STYLE: name},
});

/** `draw letters ⟨bold|normal⟩` — the one thing that tells a title from a
 *  caption when everything is one family at one size. */
export const weight = (of: 'bold' | 'normal') => ({
  type: 'world_pen_weight',
  fields: {WEIGHT: of},
});

/** `draw rectangle at x ⟨⟩ y ⟨⟩ size ⟨⟩ by ⟨⟩`. */
export const rectangle = (
  x: number | object,
  y: number | object,
  width: number | object,
  height: number | object,
) => ({
  type: 'world_draw_rectangle',
  // A NUMBER OR AN EXPRESSION in each, because an actor that is as big as it
  // says it is paints a panel the same size (`actors/stock/button`). A literal
  // is the shadow it always was.
  inputs: {
    X: typeof x === 'number' ? num(x) : x,
    Y: typeof y === 'number' ? num(y) : y,
    WIDTH: typeof width === 'number' ? num(width) : width,
    HEIGHT: typeof height === 'number' ? num(height) : height,
  },
});

/**
 * `draw text …`, with every part of it read off the actor.
 *
 * All four come from the Writing rule's trait rather than being typed here, which is the
 * whole point of the trait: they are per-instance state, so two Labels of one
 * kind can say different things at different sizes, set from the map editor's
 * inspector with no editor work (specs/UI_ACTORS.md).
 */
export const drawText = (x: number, y: number, own: string = LABEL_OWNER) => ({
  type: 'world_draw_text',
  inputs: {
    TEXT: textOf('TextProperty', own),
    X: num(x),
    Y: num(y),
    SIZE: textOf('TextSizeProperty', own),
    ANCHOR: textOf('TextAnchorProperty', own),
  },
});

/**
 * `draw paragraph …`, with every part of it read off the actor.
 *
 * `drawText`'s counterpart for a block of words rather than one. The column is
 * a number the caller gives, because it is a fact about the BOX and not about
 * the words: a speech box is as wide as it is drawn, whatever is said in it.
 */
export const drawParagraph = (
  x: number | object,
  y: number | object,
  width: number | object,
  own: string = LABEL_OWNER,
) => ({
  type: 'world_draw_paragraph',
  inputs: {
    TEXT: textOf('TextProperty', own),
    // A NUMBER OR AN EXPRESSION, because a box that is as big as it says it is
    // draws into a column it has to ask for (`actors/stock/label`). A literal
    // is the shadow it always was.
    WIDTH: typeof width === 'number' ? num(width) : width,
    X: typeof x === 'number' ? num(x) : x,
    Y: typeof y === 'number' ? num(y) : y,
    SIZE: textOf('TextSizeProperty', own),
    ANCHOR: textOf('TextAnchorProperty', own),
  },
});

// ── Where the pointer is, in the ACTOR's own frame ──────────────────────────
//
// THE SAME QUESTION, ASKED FOUR TIMES, and got wrong on three of them: the hit
// test decided a click landed on a turned button by its unturned box
// (`scripts/rules/pointing`, `under`); a turned Slider read a drag along the
// screen's x rather than its own; and a turned List and Dropdown picked rows
// by how far down the SCREEN the click was.
//
// A rotation takes the actor's local +x to `(cos, sin)` and its local +y to
// `(−sin, cos)`, so the offset from the middle projects onto each with two
// multiplies. Upside down works for free: a half turn makes the cosine
// negative and the axis runs the other way, which is what the thing on screen
// looks like it should do.
//
// ANYTHING THAT ASKS "where is the pointer relative to THIS" USES THESE, and
// anything that asks it some other way is almost certainly a fourth instance
// of the same bug.

/** `⟨x|y⟩ of ⟨where the mouse is⟩`, in the world's coordinates. */
export const pointerOn = (axis: 'x' | 'y') => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: axis},
    inputs: {VEC: {block: {type: 'world_mouse_position'}}},
  },
});

/** `⟨x|y⟩ of ⟨where this actor is⟩`, which is its MIDDLE. */
export const middleOn = (axis: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: axis},
    inputs: {ACTOR: me()},
  },
});

/** `sin ⟨…⟩` and `cos ⟨…⟩`, in degrees — which is what a rotation is. */
const trig = (op: 'SIN' | 'COS', of: object) => ({
  block: {type: 'math_trig', fields: {OP: op}, inputs: {NUM: of}},
});

const turned = () => ({
  block: {type: 'world_get_Space_RotationProperty', inputs: {ACTOR: me()}},
});

const maths = (op: 'ADD' | 'MINUS' | 'MULTIPLY', a: object, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});

/** How far the pointer is along the actor's OWN width, from its middle. */
export const alongX = () =>
  maths(
    'ADD',
    maths(
      'MULTIPLY',
      maths('MINUS', pointerOn('x'), middleOn('x')),
      trig('COS', turned()),
    ),
    maths(
      'MULTIPLY',
      maths('MINUS', pointerOn('y'), middleOn('y')),
      trig('SIN', turned()),
    ),
  );

/** …and how far DOWN its own height, from its middle. */
export const alongY = () =>
  maths(
    'MINUS',
    maths(
      'MULTIPLY',
      maths('MINUS', pointerOn('y'), middleOn('y')),
      trig('COS', turned()),
    ),
    maths(
      'MULTIPLY',
      maths('MINUS', pointerOn('x'), middleOn('x')),
      trig('SIN', turned()),
    ),
  );

// ── A map, and the world's events ───────────────────────────────────────────

/**
 * `define map ⟨Pause Menu⟩` — the root a map's workspace opens with.
 *
 * Returns a whole workspace serialization, which is what a `.map`'s `blocks`
 * key holds. What the map RAISES is not said here: it is what the `emit`
 * blocks in its placements say, and a row restating it was a second place for
 * one fact (specs/MAP_EVENTS_PLAN.md).
 */
export const defineMap = (name: string) => ({
  blocks: {
    blocks: [{type: 'world_map', x: 20, y: 20, fields: {NAME: name}}],
  },
});

/**
 * `emit ⟨quit⟩` as a MAP says it — the world's event, raised from a placement.
 *
 * The block type is minted from the module the event is DECLARED in, and a
 * map's events are the world's, so this is `world_emit_WorldsMain_QuitEvent`.
 * A shipped map can name that only because a project has one world and it is
 * always at the same path (`mainWorld`).
 *
 * `carrying` is the value input for an event with a parameter — `a tab is
 * chosen ⟨"HOME"⟩` — and is left off for the events that carry nothing.
 */
export const emitWorldEvent = (name: string, carrying?: object) => ({
  type: worldEventBlock('emit', name),
  ...(carrying ? {inputs: {VALUE: carrying}} : {}),
});

/** `when ⟨quit⟩` — the hat a WORLD hangs on one of its own events. */
export const hearWorldEvent = (name: string) => worldEventBlock('on', name);

const worldEventBlock = (prefix: 'emit' | 'on', name: string) =>
  `world_${prefix}_${pathSlug(MAIN_WORLD_PATH)}_${pascal(name)}Event`;
