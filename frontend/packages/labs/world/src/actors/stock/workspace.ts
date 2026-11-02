// Building a stock `.actor` file as data (`actors/actorDocument`), and the
// blocks its code is made of.
//
// The stock RULES are generated from `scripts/rules/*.mjs`, because a rule runs
// to hundreds of blocks and hand-written JSON at that size is unreadable and
// unmaintainable. These are two dozen, so they are written here directly.
//
// Nothing about a stock actor is privileged. It is a file a learner opens and
// reads, and the first thing they read is that a Label is an actor that elects
// one trait and draws one thing (specs/UI_ACTORS.md).

import {stockAnimation} from '../../appearance/stock';
import {pascal, STARTS_EMPTY} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import type {Timeline} from '../../engine/core/keyframes';
import {MAIN_SCREEN_PATH} from '../../mainWorld';
import {
  ANIMATIONS_ROW,
  type ActorLiteral,
  type ActorMember,
  type ActorProperty,
  type ActorValue,
  type Block,
} from '../actorData';

/** Chain statement blocks, first at the top. */
export const chain = (blocks: object[]): object =>
  blocks.reduceRight((next, block) => ({...block, next: {block: next}}));

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
 * `play animation ⟨name⟩` — one of this actor's own animations, by the name
 * it keeps it under (`animationsRow`).
 */
export const playAnimation = (name: string) => ({
  type: 'world_play_animation',
  fields: {ANIMATION: name},
});

/**
 * The row that gives an actor its animations, by name, and plays its Main
 * (specs/ANIMATION_PLAN.md): the library's timelines, by their stock ids.
 * The pictures they read come in with the actor (`StockActor.animations`).
 */
export const animationsRow = (byName: Record<string, string>) => ({
  type: ANIMATIONS_ROW,
  extraState: {
    animations: Object.fromEntries(
      Object.entries(byName).map(([name, id]) => {
        const stock = stockAnimation(id);
        if (!stock) {
          throw new Error(`no stock animation named "${id}"`);
        }
        return [name, stock.timeline];
      }),
    ),
  },
});

/** An actor that looks like a stock animation: it is its Main. */
export const looksLike = (id: string) => animationsRow({Main: id});

/** A property this kind keeps: `define property`, as data. */
export const property = (
  type: string,
  name: string,
  value?: string,
  opts: {readonly?: boolean} = {},
): ActorProperty => ({
  name,
  type,
  access: opts.readonly ? 'readonly' : 'writable',
  // None for a type that starts empty, which has no default to state.
  ...(value === undefined || STARTS_EMPTY.has(type) ? {} : {value}),
});

/** `set ⟨name⟩ of this actor to ⟨literal⟩`, as data, for a Label's four. */
export const labelValue = (
  exportName: string,
  literal: ActorLiteral,
  own: string = LABEL_OWNER,
): ActorValue => ({setter: `world_set_${own}_${exportName}`, ...literal});

/** The library's timelines, by the names the actor keeps them under. */
export const stockAnimations = (
  byName: Record<string, string>,
): Record<string, Timeline> =>
  Object.fromEntries(
    Object.entries(byName).map(([name, id]) => {
      const stock = stockAnimation(id);
      if (!stock) {
        throw new Error(`no stock animation named "${id}"`);
      }
      return [name, stock.timeline];
    }),
  );

/** `define event`, as data: its words and the values it carries. */
export const event = (
  ...parts: Array<string | BlockParam>
): Omit<ActorMember, 'id'> => ({
  kind: 'event',
  parts: parts.map(part =>
    typeof part === 'string'
      ? {kind: 'label' as const, text: part}
      : {
          kind: 'param' as const,
          name: part.name,
          type: part.type,
          var: part.id,
        },
  ),
});

/** `define block`, as data (`defineBlock`). */
export const block = (spec: {
  say: ReadonlyArray<string | BlockParam>;
  description: string;
  private?: boolean;
  body: object[];
}): Omit<ActorMember, 'id'> => ({
  kind: 'block',
  parts: spec.say.map(part =>
    typeof part === 'string'
      ? {kind: 'label' as const, text: part}
      : {
          kind: 'param' as const,
          type: part.type,
          var: part.id,
          name: part.name,
        },
  ),
  ...(spec.description ? {description: spec.description} : {}),
  ...(spec.private ? {hidden: true as const} : {}),
  ...(spec.body.length ? {body: chain(spec.body) as Block} : {}),
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

/**
 * `⟨a⟩ + ⟨b⟩ + ⟨c⟩` — words joined in the order they are read.
 *
 * THE ADAPTER IS THE CHAIN, not a conversion. A line of text is built by
 * hanging the rest of it off a block's `ADD` socket, and only a few blocks
 * have one: a text literal, a new line, and `as text`. So a COMPUTED piece —
 * a substring, say — has to go through `as text` in order to carry what comes
 * after it. That is what every part but the last is wrapped for.
 *
 * THE LAST PART IS NOT WRAPPED, because it carries nothing: it plugs straight
 * into the socket above it. `as text` means "say this value as words", and one
 * put on something already words says the words needed turning into words —
 * the same mistake `domainBlocks.worldAsText` already warns about, and one
 * that shows: a splice of two substrings drew three blocks where it needed
 * two, with a pair of quotes round the end of every line.
 *
 * SO EVERY PART MUST ALREADY BE WORDS. A number or a choice is wrapped by the
 * caller, which is where that decision belongs: `"n = " + 1 + 2` is "n = 12"
 * and `1 + 2 + " left"` is "3 left", the same three links meaning two
 * different things.
 *
 * One part joins nothing and is returned as it is.
 */
export const joined = (parts: object[]): object => {
  let chained = parts[parts.length - 1];
  for (let at = parts.length - 2; at >= 0; at -= 1) {
    chained = {
      block: {
        type: 'world_as_text',
        inputs: {VALUE: parts[at], ADD: chained},
      },
    };
  }
  return chained;
};

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
 * map's events are the game's, so this is `world_emit_ScreensMain_QuitEvent`.
 * A shipped map can name that only because a game has one Main Screen and it
 * is always at the same path (`mainWorld`).
 *
 * `carrying` is the value input for an event with a parameter — `a tab is
 * chosen ⟨"HOME"⟩` — and is left off for the events that carry nothing.
 */
export const emitWorldEvent = (
  name: string,
  carrying?: object,
  owner = MAIN_SCREEN_PATH,
) => ({
  type: worldEventBlock('emit', name, owner),
  ...(carrying ? {inputs: {VALUE: carrying}} : {}),
});

/**
 * `when ⟨quit⟩` — the hat the Main Screen hangs on one of the game's own
 * events (specs/SCREEN_MAP_PLAN.md).
 */
export const hearWorldEvent = (name: string, owner = MAIN_SCREEN_PATH) =>
  worldEventBlock('on', name, owner);

const worldEventBlock = (
  prefix: 'emit' | 'on',
  name: string,
  owner = MAIN_SCREEN_PATH,
) => `world_${prefix}_${pathSlug(owner)}_${pascal(name)}Event`;
