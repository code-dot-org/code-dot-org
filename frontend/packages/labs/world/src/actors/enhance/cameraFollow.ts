// "A camera that follows an actor" — the second enhancement, and the WORLD's.
//
// A level bigger than the screen is the commonest thing a learner builds and
// the commonest thing they cannot finish: the player walks off the right-hand
// side and the game goes on without them. The answer is the world's MAIN
// camera, given `Follows` and told whom to follow — kept on the world's main
// map as data, as the map editor's camera inspector keeps it, so it shows
// there as the main camera's traits and fields and not as blocks
// (`placementCameras`).
//
// IT IS THE WORLD'S, and that took a wrong turn to see. It was offered from an
// actor's sparkles — "the camera follows THIS one" — and answering wrote nothing
// at all into the actor's file: the camera belongs to the world, and the actor
// appears in it as a VALUE. Which camera a world looks through, and what it is
// aimed at, are facts about the world's view; a camera is not an actor and an
// actor cannot hold one.
//
// So the subject is the world and the actor is an ANSWER: the shelf asks which
// one to follow, under the row, from the actors that world can name.
//
// ONE VIEW PER WORLD, so enhancing a second actor REPOINTS the main camera
// rather than adding a rival: "follow this one" said twice is a learner
// changing their mind rather than asking for two cameras. Whatever else the
// main camera elects is left as it was.
//
// It used to write a `define camera` and a `look through camera` at the end of
// the world, after everything else, because `any ⟨Player⟩` is read where the
// camera is declared. A stored camera is declared after the world's rows
// whatever they hold, so the order is no longer the learner's to get right.

import type {MultiFileSource} from '@code-dot-org/core/api';

import type {MainCameraSettings} from '../../blockly/placementCameras';
import {authoredName} from '../../blockly/projectModules';
import {fileIdAt, filePath} from '../../runtime/projectFiles';

import {edit, importRules} from './actorPatch';
import type {Enhancement, EnhanceChoice, EnhanceTarget} from './enhancements';

/** The trait that aims a camera, which brings the one that moves the view. */
const FOLLOWS = 'Camera Follow#FollowsTrait';
/** The field it is aimed by, as the camera inspector stores it. */
const ACTOR_TO_FOLLOW = 'world_set_CameraFollow_ActorToFollowProperty';

/** A world's file, as much of it as this reads. */
interface WorldFile {
  map?: {mainCamera?: MainCameraSettings} & Record<string, unknown>;
}

/**
 * The actors this world can name, as the field names them: the project's
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

/** Whom the world's main camera follows, if it follows anybody. */
const aimedAt = (contents: string): string | undefined => {
  const camera = (JSON.parse(contents) as WorldFile).map?.mainCamera;
  return camera?.traits.includes(FOLLOWS)
    ? camera.values.find(value => value.setter === ACTOR_TO_FOLLOW)?.value
    : undefined;
};

/**
 * The world's file with its main camera following `actor`.
 *
 * In place: a value already there is replaced where it stands, so asking
 * twice for the same actor writes the same file.
 */
const following = (contents: string, actor: string): string => {
  const file = JSON.parse(contents) as WorldFile;
  // A world that holds no map yet gets one with nothing on it, which is what
  // a stored camera is kept on.
  const map = file.map ?? {type: 'map', actors: []};
  const held = map.mainCamera ?? {traits: [], values: []};
  const aim = {setter: ACTOR_TO_FOLLOW, type: 'actor', value: actor};
  const values = held.values.some(value => value.setter === ACTOR_TO_FOLLOW)
    ? held.values.map(value => (value.setter === ACTOR_TO_FOLLOW ? aim : value))
    : [...held.values, aim];
  file.map = {
    ...map,
    mainCamera: {
      traits: held.traits.includes(FOLLOWS)
        ? held.traits
        : [...held.traits, FOLLOWS],
      values,
    },
  };
  return JSON.stringify(file, null, 2);
};

export const cameraFollowEnhancement: Enhancement = {
  id: 'cameraFollow',
  // The WORLD's: a camera is defined in a world, looked through by a world,
  // and aimed at an actor it names. Nothing lands in the actor's file.
  subject: 'world',
  name: 'A camera that follows an actor',
  description:
    'Makes this world’s main camera keep one actor on screen, so a level can be bigger than the window. A world has one view, so asking again points the same camera at something else.',
  brings: ['Follows an Actor', 'Has a Camera'],
  asks: {
    label: 'Following',
    options: source => actorsFor(source),
  },
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const id = fileIdAt(source, `${target.path}.world`);
    if (!id) {
      return false;
    }
    const aimed = aimedAt(source.files[id].contents);
    // With nothing chosen yet the question is "has this world got one at all";
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

    const id = fileIdAt(current, `${target.path}.world`);
    if (!id) {
      return current;
    }
    return edit(current, id, contents => following(contents, answer));
  },
};

/** What a world's follow camera is aimed at — exported for its test. */
export const followedIn = (contents: string): string | undefined =>
  aimedAt(contents);
