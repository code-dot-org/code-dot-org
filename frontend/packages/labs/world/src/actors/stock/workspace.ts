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

/** `⟨name⟩ of this actor`, for a property the Writing rule declares. */
export const textOf = (exportName: string) => ({
  block: {type: `world_get_Writing_${exportName}`, inputs: {ACTOR: me()}},
});

/** `set ⟨name⟩ of this actor to ⟨value⟩`, for one the Writing rule declares. */
export const setText = (exportName: string, value: object) => ({
  type: `world_set_Writing_${exportName}`,
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
  value: string,
  opts: {readonly?: boolean} = {},
) => ({
  type: 'world_rule_property',
  fields: {
    TYPE: type,
    ACCESS: opts.readonly ? 'readonly' : 'writable',
    NAME: name,
    DEFAULT: value,
  },
});

/**
 * `define event` — something that HAPPENS to this kind.
 *
 * The words are the hat it makes: `finishes revealing` becomes
 * `when ⟨…⟩ finishes revealing`. Labels only, which is every event a stock
 * actor has wanted; a designed parameter is a filter and belongs to a rule
 * with choices to filter on (specs/ENUMS.md).
 */
export const defineEvent = (...labels: string[]) => ({
  type: 'world_rule_event',
  extraState: {parts: labels.map(text => ({kind: 'label', text}))},
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
  body: object[];
}) => ({
  type: 'world_rule_block',
  fields: {RETURNS: 'none', DESCRIPTION: spec.description},
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
          // The handlers, laid out down the left: the reading order of a file
          // is what a learner opening it meets first.
          ...(extras.handlers ?? []).map((handler, index) => ({
            ...handler,
            x: 20,
            y: 180 + index * 120,
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
export const drawText = (x: number, y: number) => ({
  type: 'world_draw_text',
  inputs: {
    TEXT: textOf('TextProperty'),
    X: num(x),
    Y: num(y),
    SIZE: textOf('TextSizeProperty'),
    ANCHOR: textOf('TextAnchorProperty'),
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
) => ({
  type: 'world_draw_paragraph',
  inputs: {
    TEXT: textOf('TextProperty'),
    // A NUMBER OR AN EXPRESSION, because a box that is as big as it says it is
    // draws into a column it has to ask for (`actors/stock/label`). A literal
    // is the shadow it always was.
    WIDTH: typeof width === 'number' ? num(width) : width,
    X: typeof x === 'number' ? num(x) : x,
    Y: typeof y === 'number' ? num(y) : y,
    SIZE: textOf('TextSizeProperty'),
    ANCHOR: textOf('TextAnchorProperty'),
  },
});
