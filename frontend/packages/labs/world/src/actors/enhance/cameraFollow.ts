// "A camera that follows an actor" — the second enhancement, and the game's.
//
// A level bigger than the screen is the commonest thing a learner builds and
// the commonest thing they cannot finish: the player walks off the right-hand
// side and the game goes on without them. The answer is a camera on the
// Viewport the Main Screen shows its level through, given `Follows` and told
// whom to follow — kept on the Viewport's placement as data, as its camera
// inspector keeps it, so it shows there as that camera's traits and fields
// and not as blocks (`placementCameras`).
//
// IT IS THE GAME'S, and that took a wrong turn to see. It was offered from an
// actor's sparkles — "the camera follows THIS one" — and answering wrote nothing
// at all into the actor's file: the camera belongs to the view, and the actor
// appears in it as a VALUE. A camera is not an actor and an actor cannot hold
// one. So the subject is the game, and the actor is an ANSWER: the shelf asks
// which one to follow, under the row, from the actors the game can name.
//
// ONE VIEW PER GAME, so enhancing a second actor REPOINTS the camera rather
// than adding a rival: "follow this one" said twice is a learner changing
// their mind rather than asking for two cameras. Whatever else that camera
// elects is left as it was.

import type {MultiFileSource} from '@code-dot-org/core/api';

import type {PlacementCamera} from '../../blockly/placementCameras';
import {authoredName} from '../../blockly/projectModules';
import {fileIdAt, filePath} from '../../runtime/projectFiles';

import {edit, importRules} from './actorPatch';
import type {Enhancement, EnhanceChoice, EnhanceTarget} from './enhancements';

/** The trait that aims a camera, which brings the one that moves the view. */
const FOLLOWS = 'Camera Follow#FollowsTrait';
/** The field it is aimed by, as the camera inspector stores it. */
const ACTOR_TO_FOLLOW = 'world_set_CameraFollow_ActorToFollowProperty';

/** The Viewport the Main Screen shows its level through. */
const GAME = 'Game';
/** The first camera a Viewport is given, as the lessons give one. */
const FIRST = {id: 'camera1', name: 'Camera 1'};

type Placement = {
  id: string;
  type: string;
  properties?: Record<string, Record<string, unknown>>;
  cameras?: PlacementCamera[];
};

/** A Main Screen, as much of it as this reads. */
interface ScreenFile {
  actors?: Placement[];
  [key: string]: unknown;
}

/** The Game Viewport, and the camera of its own it looks through, if any. */
const viewOf = (screen: ScreenFile) => {
  const game = (screen.actors ?? []).find(
    one => one.id === GAME && one.type === 'actors/viewport',
  );
  const through = game?.properties?.showsMap?.showsThrough;
  const camera = game?.cameras?.find(one => one.name === through);
  return {game, camera};
};

/**
 * The actors the game can name, as the field names them: the project's
 * `.actor` files, by module path. Read from the files as they stand, since
 * the answer is a choice about the project rather than about this
 * enhancement.
 */
const actorsFor = (source: MultiFileSource): EnhanceChoice[] => {
  const files = Object.keys(source.files)
    .map(id => ({id, path: filePath(source, id) ?? ''}))
    .filter(one => one.path.endsWith('.actor'))
    .map(one => ({
      value: one.path.replace(/\.actor$/, ''),
      name:
        authoredName(source.files[one.id].contents ?? '') ??
        (one.path.split('/').pop() ?? '').replace(/\.actor$/, ''),
    }));
  return files;
};

/** Whom the Game Viewport's camera follows, if it follows anybody. */
const aimedAt = (contents: string): string | undefined => {
  const {camera} = viewOf(JSON.parse(contents) as ScreenFile);
  return camera?.traits.includes(FOLLOWS)
    ? camera.values.find(value => value.setter === ACTOR_TO_FOLLOW)?.value
    : undefined;
};

/**
 * The Main Screen with the camera its Game Viewport looks through following
 * `actor` — one given to it when it looks through its main camera.
 *
 * In place: a value already there is replaced where it stands, so asking
 * twice for the same actor writes the same file.
 */
const following = (contents: string, actor: string): string => {
  const screen = JSON.parse(contents) as ScreenFile;
  const {game, camera} = viewOf(screen);
  if (!game) {
    return contents;
  }
  const held = camera ?? {...FIRST, traits: [], values: []};
  const aim = {setter: ACTOR_TO_FOLLOW, type: 'actor', value: actor};
  const values = held.values.some(value => value.setter === ACTOR_TO_FOLLOW)
    ? held.values.map(value => (value.setter === ACTOR_TO_FOLLOW ? aim : value))
    : [...held.values, aim];
  const aimed: PlacementCamera = {
    ...held,
    traits: held.traits.includes(FOLLOWS)
      ? held.traits
      : [...held.traits, FOLLOWS],
    values,
  };
  const cameras = camera
    ? (game.cameras ?? []).map(one => (one === camera ? aimed : one))
    : [...(game.cameras ?? []), aimed];
  const next: Placement = {
    ...game,
    cameras,
    properties: {
      ...game.properties,
      showsMap: {...game.properties?.showsMap, showsThrough: aimed.name},
    },
  };
  return JSON.stringify(
    {
      ...screen,
      actors: (screen.actors ?? []).map(one => (one === game ? next : one)),
    },
    null,
    2,
  );
};

export const cameraFollowEnhancement: Enhancement = {
  id: 'cameraFollow',
  // The GAME's: a camera is the Viewport's the game is shown through, and
  // aimed at an actor it names. Nothing lands in the actor's file.
  subject: 'world',
  name: 'A camera that follows an actor',
  description:
    'Makes the camera the game is shown through keep one actor on screen, so a level can be bigger than the window. A game has one view, so asking again points the same camera at something else.',
  brings: ['Follows an Actor', 'Has a Camera'],
  asks: {
    label: 'Following',
    options: source => actorsFor(source),
  },
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const id = fileIdAt(source, `${target.path}.screen`);
    if (!id) {
      return false;
    }
    const aimed = aimedAt(source.files[id].contents);
    // With nothing chosen yet the question is "has this game got one at all";
    // with an answer it is the sharper "is it already following that".
    return answer === undefined ? aimed !== undefined : aimed === answer;
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (!answer) {
      return source; // nothing to aim at, so nothing to do
    }
    // Which brings "Has a Camera" with it: this rule aims a camera and the
    // other one is what actually moves the view.
    const current = importRules(source, ['Camera Follow']);

    const id = fileIdAt(current, `${target.path}.screen`);
    if (!id) {
      return current;
    }
    return edit(current, id, contents => following(contents, answer));
  },
};

/** What the game's follow camera is aimed at — exported for its test. */
export const followedIn = (contents: string): string | undefined =>
  aimedAt(contents);
