// The Blockly a lesson's world is written in.
//
// Small, repetitive shapes — a world with a size and some actors placed in it —
// which every lesson needs and none of them should spell out. The block types
// and socket names are not guessable and a wrong one fails quietly, so they are
// written once here and read from the fixtures that already prove them
// (`src/fixtures`, and AGENTS.md on dumping the palette before writing a
// block).

import {chain, me, num} from '../../actors/stock/workspace';

/** `set position of ⟨this actor⟩ x ⟨…⟩ y ⟨…⟩`, inside an `add actor`. */
export const placeAt = (x: number, y: number) => ({
  type: 'world_set_position',
  inputs: {ACTOR: me(), X: num(x), Y: num(y)},
});

/**
 * `add actor ⟨Hero⟩ do ⟨…⟩`.
 *
 * The actor is named the way its dropdown names it: the module path of its
 * file, `actors/<stem>` — see `actorPath`.
 */
export const addActor = (actor: string, body: object[]) => ({
  type: 'world_add_actor',
  fields: {ACTOR: actor},
  ...(body.length ? {inputs: {DO: {block: chain(body)}}} : {}),
});

/**
 * `actors/<stem>` — how an ACTOR dropdown names an actor, which is by its file.
 *
 * The stem is the `id` the lesson gave its `ActorSpec`, which `worldFile`
 * writes out as `actors/<id>.actor`. It used to be `local:<block id>`, naming
 * a `define actor` the world held among its own roots; every actor is a file
 * now (specs/ENHANCEMENTS.md, the closing note), and the id is the file.
 */
export const actorPath = (id: string): string => `actors/${id}`;

/**
 * `any ⟨Kind⟩` — a hat's subject, and so the TEMPLATE rather than an instance.
 *
 * What `this actor` says in an `.actor` file, said from the world: a handler
 * written beside a definition is about that kind, and one written in a world
 * has to name the kind it is about. Inside the handler `this actor` still
 * means the actor the event fired for.
 */
export const anyKind = (id: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: actorPath(id)}},
});

/** A drawing spec as the ROW an actor's chain holds. */
const drawingBlock = (drawing: {
  width: number;
  height: number;
  commands: object[];
}) => ({
  type: 'world_define_drawing',
  // Sockets rather than fields: the size is read off the actor now, so a fixed
  // one is a number shadow in each (`actors/stock/workspace.drawingRow`).
  inputs: {
    WIDTH: {shadow: {type: 'math_number', fields: {NUM: drawing.width}}},
    HEIGHT: {shadow: {type: 'math_number', fields: {NUM: drawing.height}}},
    DO: {block: chain(drawing.commands)},
  },
});

/**
 * How tall a stack of rows draws, in rows.
 *
 * Blockly lays nothing out for us: a root is placed at the x and y the file
 * says, and two roots at the same y overlap. Nothing here can measure a block,
 * so this counts what stacks — a row, and the rows in a row's `do` — and the
 * caller turns rows into pixels. Values in sockets are not counted: they draw
 * inside the row that holds them.
 *
 * An estimate, and it only has to be generous enough that a lesson does not
 * open with its actors written across its world.
 */
const rowsTall = (value: unknown): number => {
  if (Array.isArray(value)) {
    return value.reduce<number>((total, row) => total + rowsTall(row), 0);
  }
  if (typeof value !== 'object' || value === null) {
    return 0;
  }
  const row = value as {
    type?: unknown;
    next?: {block?: unknown};
    inputs?: Record<string, {block?: unknown}>;
  };
  const bodies = Object.entries(row.inputs ?? {})
    .filter(([name]) => name === 'DO')
    .reduce<number>((total, [, socket]) => total + rowsTall(socket.block), 0);
  // A row that WRAPS a body draws taller than the rows in it: the C shape has
  // a lip above and a foot below. Counted as most of another row, because six
  // `add actor`s undercounted by that lip put the next root on top of them.
  return 1 + (bodies ? bodies + 0.7 : 0) + rowsTall(row.next?.block);
};

/** Rows to pixels, with room under a stack for the next root. */
const PIXELS_PER_ROW = 40;
const GAP = 60;
const below = (y: number, rows: number): number =>
  y + rows * PIXELS_PER_ROW + GAP;

/** An actor a lesson's world places: a file of its own, beside the world. */
export interface ActorSpec {
  /**
   * The file's stem: `hero` is `actors/hero.actor`.
   *
   * Not decoration: a placement names the actor by it (`actorPath`), a hat's
   * subject resolves through it (`anyKind`), and a property declared in the
   * actor mints its blocks from it — `world_get_Actors<Id>_…`, where the id
   * is capitalised (`ruleRegistry.pathSlug`).
   */
  id: string;
  /** Its NAME, which is the kind — what `is a ⟨Hero⟩` reads. */
  name: string;
  /** The rows of the definition: traits, a sprite, its own properties. */
  rows: object[];
  /** The picture it paints, for an actor with no sprite. */
  drawing?: {width: number; height: number; commands: object[]};
  /**
   * Event handlers of the actor's own, each a ROOT beside its definition.
   *
   * A hat about `this actor` belongs in the actor's file, where `this actor`
   * is the kind being defined; written in the world it would be about
   * nobody. A hat about `any ⟨Kind⟩` is the world's and goes in `handlers`
   * on the world spec instead.
   */
  handlers?: object[];
}

/**
 * `define actor ⟨Hero⟩`, as the root of the actor's own file.
 *
 * A drawing is a ROW in the chain, which is where an actor file keeps one
 * (`actors/stock/workspace.drawingRow`).
 */
const defineActor = ({name, rows, drawing}: ActorSpec) => ({
  type: 'world_actor',
  x: 20,
  y: 20,
  fields: {NAME: name},
  next: {
    block: chain([...rows, ...(drawing ? [drawingBlock(drawing)] : [])]),
  },
});

/** An `.actor` file holding one definition, and its own hats beside it. */
export const actorFileOf = (spec: ActorSpec): string => {
  const root = defineActor(spec);
  let y = below(20, rowsTall(root));
  const beside = (spec.handlers ?? []).map(hat => {
    const at = {...hat, x: 20, y};
    y = below(y, rowsTall(hat));
    return at;
  });
  return JSON.stringify({blocks: {blocks: [root, ...beside]}}, null, 2);
};

/**
 * `define ⟨type⟩ property ⟨name⟩ with default ⟨…⟩`.
 *
 * One block in four homes (`blockly/ownProperties`): at a rule's top level it
 * is the world's, inside a `define trait` it is the trait's, and chained under
 * a `define world` or a `define actor` it belongs to that file. The homes are
 * what these lessons are about, so they place it themselves.
 */
export const declareProperty = (
  type: 'number' | 'text' | 'boolean' | 'color' | 'vector' | 'actor',
  name: string,
  value: string,
) => ({
  type: 'world_rule_property',
  fields: {TYPE: type, ACCESS: 'writable', NAME: name, DEFAULT: value},
});

export interface WorldSpec {
  name: string;
  /**
   * Map size in TILES, for a world that wants one — and most do not.
   *
   * A world says nothing and gets one screen (`VIEWPORT_TILES`, ten tiles each
   * way, 320 by 320). That is the right answer for every lesson that has no
   * camera and no boundary rule, which is all the early ones: `set size of map`
   * matters when the world is BIGGER than the view, and putting it in a first
   * lesson is an advanced idea sitting in the way of a simple one.
   *
   * It was in all of them at first, out of a half-remembered warning
   * (AGENTS.md) about a world that arranges its own actors having no bounds. It
   * has bounds — the viewport's. What it lacks is bounds of its own, which only
   * something looking past the edge would notice.
   */
  tiles?: [x: number, y: number];
  /** What is placed in it, in order. */
  rows: object[];
  /**
   * The actors this world places, each written out as a file of its own.
   *
   * They used to be roots beside the world, so that a lesson was one file: a
   * sidebar of eleven files argues with a lesson that is about one of them.
   * The sidebar still stays off until a lesson is about files (`making/read`);
   * what changed is that an actor is a file everywhere in the lab now, and a
   * lesson reaches it the way a learner does — as a tab beside the world,
   * which `lessonSource` opens for every actor listed here.
   */
  actors?: ActorSpec[];
  /**
   * Event handlers the world itself answers, each a ROOT of its own.
   *
   * A hat takes no previous connection, and `DisableOrphansPlugin` disables a
   * top-level block that has one along with everything below it — so a handler
   * sits beside the `define world` rather than in it, exactly as `actorFile`
   * places an actor's (specs/DRAWING.md).
   *
   * It also runs somewhere else, which is the part that matters when writing a
   * lesson: a `define world` body is handed a BUILDER, and a handler is handed
   * the world. A rule's action — `world.act(…)` — is a line only the second can
   * run, so a lesson that wants one wants a handler.
   */
  handlers?: object[];
}

/** A `.world` file. */
/** What `worldFile` hands a lesson: the world, and the actor files beside it. */
export interface LessonWorld {
  /** `main.world`, as a Blockly workspace. */
  world: string;
  /** Actor files by stem, in the order the world spec listed them. */
  actors: Record<string, string>;
}

export const worldFile = ({
  name,
  tiles,
  rows,
  actors,
  handlers,
}: WorldSpec): LessonWorld => {
  const inside = [
    ...(tiles
      ? [
          {
            type: 'world_set_map_size',
            inputs: {X: num(tiles[0]), Y: num(tiles[1])},
          },
        ]
      : []),
    ...rows,
  ];
  // A world that puts nothing in itself is a real thing to start a lesson
  // from — everything it holds arrives while it runs — and `chain` of nothing
  // has no first block to hand back.
  const placed = inside.length ? chain(inside) : undefined;
  const world = {
    type: 'world_world',
    x: 20,
    y: 20,
    fields: {NAME: name},
    ...(placed ? {next: {block: placed}} : {}),
  };
  // Laid out down the left, in the order a reader wants them: the world, then
  // what is in it, then what it does. Stacked by an ESTIMATE of each one's
  // height (`rowsTall`), because a lesson's world can be two rows or twelve,
  // and a fixed ladder writes the actors across the world in the second case.
  let y = below(20, rowsTall(world));
  const beside = (handlers ?? []).map(root => {
    const at = {...root, x: 20, y};
    y = below(y, rowsTall(root));
    return at;
  });
  return {
    world: JSON.stringify({blocks: {blocks: [world, ...beside]}}, null, 2),
    actors: Object.fromEntries(
      (actors ?? []).map(spec => [spec.id, actorFileOf(spec)]),
    ),
  };
};
