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

/** A colour socket's default — a swatch, which is what a colour block is. */
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

/**
 * A stock actor's file: the definition, and the drawing beside it.
 *
 * TWO ROOTS, not one. A drawing is a definition root of its own — it takes no
 * previous connection, because `DisableOrphansPlugin` disables a top-level
 * block that has one along with everything below it (specs/DRAWING.md). So it
 * sits beside the `define actor` rather than inside it, exactly as `each frame`
 * does in an actor file.
 */
export const actorFile = (
  name: string,
  rows: object[],
  drawing: {width: number; height: number; commands: object[]},
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
            ...(rows.length ? {next: {block: chain(rows)}} : {}),
          },
          {
            type: 'world_define_drawing',
            x: 20,
            y: 180,
            fields: {WIDTH: drawing.width, HEIGHT: drawing.height},
            inputs: {DO: {block: chain(drawing.commands)}},
          },
        ],
      },
    },
    null,
    2,
  );

/** `set fill ⟨colour⟩`. */
export const fill = (color: object) => ({
  type: 'world_pen_fill',
  inputs: {COLOUR: color},
});

/** `set outline ⟨colour⟩ width ⟨n⟩`. */
export const outline = (color: object, width: number) => ({
  type: 'world_pen_outline',
  inputs: {COLOUR: color, WIDTH: num(width)},
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
