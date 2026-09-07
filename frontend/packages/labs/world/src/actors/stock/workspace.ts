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

/** What an actor file may hold beside its `define actor`. */
export interface ActorExtras {
  /**
   * The picture it paints, for an actor that has no sprite.
   *
   * Only an interface actor needs one. A Label has no picture and must paint
   * itself; a Coin has a picture and must not, since a drawing would cover it.
   */
  drawing?: {width: number; height: number; commands: object[]};
  /**
   * Event handlers — `when this actor presses ⟨space⟩` and the like.
   *
   * A hat is a root of its own, so these sit beside the definition. They are
   * for what the actor does to ITSELF: a Player binds the space bar because
   * a control scheme is what a player is. What it does to other actors is the
   * project's, and belongs in the world.
   */
  handlers?: object[];
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
                      ...(extras.drawing
                        ? [
                            {
                              type: 'world_define_drawing',
                              fields: {
                                WIDTH: extras.drawing.width,
                                HEIGHT: extras.drawing.height,
                              },
                              inputs: {
                                DO: {block: chain(extras.drawing.commands)},
                              },
                            },
                          ]
                        : []),
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
  x: number,
  y: number,
  width: number,
  height: number,
) => ({
  type: 'world_draw_rectangle',
  inputs: {X: num(x), Y: num(y), WIDTH: num(width), HEIGHT: num(height)},
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
export const drawParagraph = (x: number, y: number, width: number) => ({
  type: 'world_draw_paragraph',
  inputs: {
    TEXT: textOf('TextProperty'),
    WIDTH: num(width),
    X: num(x),
    Y: num(y),
    SIZE: textOf('TextSizeProperty'),
    ANCHOR: textOf('TextAnchorProperty'),
  },
});
