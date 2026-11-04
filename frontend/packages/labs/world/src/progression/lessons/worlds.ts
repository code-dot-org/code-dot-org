// A lesson's game as a game is written: a Main Screen whose Game Viewport
// shows `main.map`, and the actor files beside them.
//
// The block types and socket names a lesson's code uses are not guessable and
// a wrong one fails quietly, so the shapes every lesson needs are written once
// here.

import {
  actorDocument,
  type ActorSpec as DataSpec,
} from '../../actors/actorDocument';
import {chain, me, num} from '../../actors/stock/workspace';
import type {CameraValue} from '../../blockly/placementCameras';
import type {
  ScreenEvent,
  ScreenProperty,
  ScreenRuleSetting,
} from '../../blockly/screenData';
import {gameScreen} from '../../constants';
import {TILE_SIZE} from '../../runtime/viewport';

const GAME = 'Game';

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
 * The stem is the `id` the lesson gave its `ActorSpec`, which `screenFile`
 * writes out as `actors/<id>.actor`.
 */
export const actorPath = (id: string): string => `actors/${id}`;

/**
 * `any ⟨Kind⟩` as a value: every actor of that kind there is. A handler
 * about a kind says so in its own `SUBJECT` field, with `actorPath`.
 */
export const anyKind = (id: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: actorPath(id)}},
});

/** An actor a lesson places: a file of its own, beside the screen. */
export interface ActorSpec extends DataSpec {
  /**
   * The file's stem: `hero` is `actors/hero.actor`.
   *
   * Not decoration: a placement names the actor by it (`actorPath`), a hat's
   * subject resolves through it (`anyKind`), and a property declared in the
   * actor mints its blocks from it — `world_get_Actors<Id>_…`, where the id
   * is capitalised (`ruleRegistry.pathSlug`).
   */
  id: string;
}

/** An `.actor` file holding the actor's data. */
export const actorFileOf = (spec: ActorSpec): string =>
  actorDocument(
    Object.fromEntries(
      Object.entries(spec).filter(([key]) => key !== 'id'),
    ) as DataSpec,
  );

/** A property the Main Screen declares: the game's own, which one copy of. */
export const declareProperty = (
  type: 'number' | 'text' | 'boolean' | 'color' | 'vector' | 'actor',
  name: string,
  value: string,
): ScreenProperty => ({name, type, value});

/** The traits a camera elects and their values (`placementCameras`). */
export interface MainCameraSettings {
  traits: string[];
  values: CameraValue[];
}

export interface ScreenSpec {
  /** The game's name, which the Main Screen holds. */
  name: string;
  /**
   * The level's size in TILES, for one that wants a size of its own; the rest
   * are a screen's (`VIEWPORT_TILES`, ten tiles each way). A size matters to a
   * level bigger than the view, which an early lesson has no use for.
   */
  tiles?: [x: number, y: number];
  /** What `main.map` places, in order (`placeInMap`). */
  placed?: MapRow[];
  /** The traits and values the Game Viewport's camera elects. */
  mainCamera?: MainCameraSettings;
  /** The game's own values (`declareProperty`). */
  properties?: ScreenProperty[];
  /** The game's own events, which a screen raises by name. */
  events?: ScreenEvent[];
  /** Rule settings that differ from the rules' own. */
  rules?: ScreenRuleSetting[];
  /** The screen's color, behind the Game Viewport. */
  backgroundColor?: string;
  /** `main.map`'s own color, which the Game Viewport paints behind it. */
  mapColor?: string;
  /**
   * Code under `when this screen loads`, which is always there, empty or not:
   * it is where a lesson's once-only code is written.
   */
  loads?: object[];
  /** Hats beside it, each a root of its own. */
  handlers?: object[];
  /**
   * The actors the lesson's level places, each written out as a file of its
   * own, which `lessonSource` opens beside the screen.
   */
  actors?: ActorSpec[];
}

/** What `screenFile` hands a lesson. */
export interface LessonScreen {
  /** `main.screen`: the game's data, its Game Viewport and its code. */
  screen: string;
  /** `main.map`: the level the Game Viewport shows. */
  map: string;
  /** Actor files by stem, in the order the spec listed them. */
  actors: Record<string, string>;
}

/** A placement as a lesson writes one: an id and what it overrides. */
export interface LessonPlacement {
  id: string;
  properties?: Record<string, Record<string, unknown>>;
}

/** Many of one kind, placed on `main.map`. */
export const placeInMap = (
  kind: string,
  placements: LessonPlacement[],
): MapRow => placements.map(placement => ({type: kind, ...placement}));

type MapRow = Array<{type: string} & LessonPlacement>;

/** One of a kind on `main.map`, at `x`, `y`, with what else it overrides. */
export const placedAt = (
  kind: string,
  id: string,
  x: number,
  y: number,
  more: Record<string, Record<string, unknown>> = {},
): MapRow =>
  placeInMap(kind, [
    {id, properties: {positional: {position: {x, y}}, ...more}},
  ]);

const SCREEN_LOADS = 'world_on_screen_loads';

export const screenFile = ({
  name,
  tiles,
  placed,
  mainCamera,
  properties,
  events,
  rules,
  backgroundColor,
  mapColor,
  loads,
  handlers,
  actors,
}: ScreenSpec): LessonScreen => {
  const taken = new Set<string>();
  const placements = (placed ?? []).flat().map(placement => {
    if (taken.has(placement.id)) {
      throw new Error(`two placements called ${placement.id}`);
    }
    taken.add(placement.id);
    return placement;
  });
  const data = {
    ...(properties?.length ? {properties} : {}),
    ...(events?.length ? {events} : {}),
    ...(rules?.length ? {rules} : {}),
    ...(backgroundColor ? {backgroundColor} : {}),
  };
  const screen = JSON.parse(gameScreen(name, data)) as {
    actors: Array<Record<string, unknown>>;
  };
  if (mainCamera) {
    const game = screen.actors.find(one => one.id === GAME)!;
    game.camera = {...mainCamera};
  }
  const first = loads?.length ? chain(loads) : undefined;
  const roots = [
    ...(handlers ?? []),
    {type: SCREEN_LOADS, ...(first ? {next: {block: first}} : {})},
  ].map((root, at) => ({...root, x: 20, y: 20 + at * 200}));
  return {
    screen: JSON.stringify(
      {...screen, blocks: {blocks: {languageVersion: 0, blocks: roots}}},
      null,
      2,
    ),
    map: JSON.stringify(
      {
        type: 'map',
        ...(tiles
          ? {
              size: {width: tiles[0], height: tiles[1]},
              tile: {width: TILE_SIZE, height: TILE_SIZE},
            }
          : {}),
        ...(mapColor ? {backgroundColor: mapColor} : {}),
        actors: placements,
      },
      null,
      2,
    ),
    actors: Object.fromEntries(
      (actors ?? []).map(spec => [spec.id, actorFileOf(spec)]),
    ),
  };
};
