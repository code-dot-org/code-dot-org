// "A camera that follows an actor" — the second enhancement, and the WORLD's.
//
// A level bigger than the screen is the commonest thing a learner builds and
// the commonest thing they cannot finish: the player walks off the right-hand
// side and the game goes on without them. The answer is five blocks in three
// places, and none of them is anywhere near the actor:
//
//   worlds/*.world           define camera ⟨Follow Camera⟩ do:
//                              use trait ⟨Camera Follow#Follows⟩
//                              set actor to follow of ⟨this camera⟩
//                                to ⟨any ⟨target⟩⟩
//                            look through camera ⟨Follow Camera⟩
//
// IT IS THE WORLD'S, and that took a wrong turn to see. It was offered from an
// actor's sparkles — "the camera follows THIS one" — and answering wrote nothing
// at all into the actor's file: the camera is defined in the world, looked
// through by the world, and the actor appears in it as a VALUE. Which camera a
// world looks through, and what it is aimed at, are facts about the world's
// view; a camera is not an actor and an actor cannot hold one.
//
// So the subject is the world and the actor is an ANSWER: the shelf asks which
// one to follow, under the row, from the actors that world can name — its own
// `define actor` blocks and the project's `.actor` files alike.
//
// APPENDED AT THE END, and the ordering is load-bearing rather than tidy.
// `any ⟨Player⟩` is read when `define camera` runs, so a camera declared above
// `load map` is handed an empty list and sits still for the whole game, with
// nothing in the console to say why. The starter fixtures write the same
// comment over the same line (`fixtures/flappy`).
//
// ONE CAMERA PER WORLD, with an id of its own, so enhancing a second actor
// REPOINTS it rather than adding a rival: a world has one view, and "follow
// this one" said twice is a learner changing their mind rather than asking for
// two cameras. A camera the learner made themselves is left alone — this owns
// the one it made and nothing else.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {authoredName} from '../../blockly/projectModules';
import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt, filePath} from '../../runtime/projectFiles';

import type {Enhancement, EnhanceChoice, EnhanceTarget} from './enhancements';
import {append, down, rootsOf, rowsUnder, type BlockJson} from './patch';

/** The rule that aims a camera, which brings the one that moves the view. */
const FOLLOWS = 'Camera Follow#FollowsTrait';

/**
 * The camera this makes, and the id it is known by.
 *
 * Fixed per world rather than per actor: a world has one view. Enhancing a
 * second actor finds this camera and points it somewhere else.
 */
const CAMERA_ID = 'enhanceFollowCamera';
const CAMERA_NAME = 'Follow Camera';

/** `any ⟨kind⟩` — the actor to follow, named as everything else names one. */
const kindOf = (actor: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: actor}},
});

/**
 * The actors this world can name, as the field names them.
 *
 * Both kinds, because a world may hold both: its own `define actor` blocks,
 * which are `local:<block>`, and the project's `.actor` files, which are their
 * module paths (`blockly/localActors`). Read from the files as they stand,
 * since the answer is a choice about the project rather than about this
 * enhancement.
 */
const actorsFor = (
  source: MultiFileSource,
  target: EnhanceTarget,
): EnhanceChoice[] => {
  const worldId = fileIdAt(source, `${target.path}.world`);
  const own = worldId ? rootsOf(source.files[worldId].contents) : [];
  const local = own
    .filter(root => root.type === 'world_actor' && root.id)
    .map(root => ({
      value: `local:${root.id}`,
      name: String(root.fields?.NAME ?? root.id),
    }));
  const files = Object.keys(source.files)
    .map(id => ({id, path: filePath(source, id) ?? ''}))
    .filter(one => one.path.endsWith('.actor'))
    .map(one => ({
      value: one.path.replace(/\.actor$/, ''),
      name:
        authoredName(source.files[one.id].contents ?? '') ??
        (one.path.split('/').pop() ?? '').replace(/\.actor$/, ''),
    }));
  return [...local, ...files];
};

/**
 * Point the camera this enhancement made somewhere else.
 *
 * In place, on the file's own JSON: the camera is where an earlier pass of
 * this left it, and rebuilding it would move it to the end of the world's
 * chain for no reason.
 */
const repoint = (contents: string, actor: string): string => {
  const workspace = JSON.parse(contents) as {blocks?: {blocks?: BlockJson[]}};
  for (const root of workspace.blocks?.blocks ?? []) {
    for (const row of down(root)) {
      if (row.type !== 'world_define_camera' || row.id !== CAMERA_ID) {
        continue;
      }
      const body = (row.inputs?.DO as {block?: BlockJson} | undefined)?.block;
      for (const inner of down(body)) {
        if (inner.type === 'world_set_CameraFollow_ActorToFollowProperty') {
          inner.inputs = {...inner.inputs, VALUE: kindOf(actor)};
        }
      }
    }
  }
  return JSON.stringify(workspace, null, 2);
};

/** The camera, and what it is for. */
const camera = (actor: string): BlockJson => ({
  type: 'world_define_camera',
  id: CAMERA_ID,
  fields: {NAME: CAMERA_NAME},
  inputs: {
    DO: {
      block: {
        type: 'world_use_trait',
        fields: {TRAIT: FOLLOWS},
        next: {
          block: {
            type: 'world_set_CameraFollow_ActorToFollowProperty',
            inputs: {
              ACTOR: {block: {type: 'world_this_camera'}},
              VALUE: kindOf(actor),
            },
          },
        },
      },
    },
  },
});

/** …and the world looking through it, since it has one already. */
const lookThrough = (): BlockJson => ({
  type: 'world_use_camera',
  fields: {CAMERA: `camera:${CAMERA_ID}`},
});

/** The `define camera` this enhancement made, if this world holds it. */
const cameraIn = (contents: string): BlockJson | undefined =>
  rowsUnder(contents, {type: 'world_world'}).find(
    row => row.type === 'world_define_camera' && row.id === CAMERA_ID,
  );

/** Who that camera is aimed at, as the field records it. */
const aimedAt = (block: BlockJson | undefined): string | undefined => {
  const body = (block?.inputs?.DO as {block?: BlockJson} | undefined)?.block;
  for (const row of down(body)) {
    if (row.type !== 'world_set_CameraFollow_ActorToFollowProperty') {
      continue;
    }
    const value = (row.inputs?.VALUE as {block?: BlockJson} | undefined)?.block;
    const actor = value?.fields?.ACTOR;
    return typeof actor === 'string' ? actor : undefined;
  }
  return undefined;
};

/** Rewrite one file's contents, leaving the rest of the project alone. */
const edit = (
  source: MultiFileSource,
  id: string,
  change: (contents: string) => string,
): MultiFileSource => ({
  ...source,
  files: {
    ...source.files,
    [id]: {...source.files[id], contents: change(source.files[id].contents)},
  },
});

export const cameraFollowEnhancement: Enhancement = {
  id: 'cameraFollow',
  // The WORLD's: a camera is defined in a world, looked through by a world,
  // and aimed at an actor it names. Nothing lands in the actor's file.
  subject: 'world',
  name: 'A camera that follows an actor',
  description:
    'Gives this world a camera that keeps one actor on screen, so a level can be bigger than the window. A world has one view, so asking again points the same camera at something else.',
  brings: ['Follows an Actor', 'Has a Camera', 'a camera to look through'],
  asks: {
    label: 'Following',
    options: (source, target) => actorsFor(source, target),
  },
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const id = fileIdAt(source, `${target.path}.world`);
    if (!id) {
      return false;
    }
    const aimed = aimedAt(cameraIn(source.files[id].contents));
    // With nothing chosen yet the question is "has this world got one at all";
    // with an answer it is the sharper "is it already following that".
    return answer === undefined ? aimed !== undefined : aimed === answer;
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (!answer) {
      return source; // nothing to aim at, so nothing to do
    }
    let current = source;
    const follow = STOCK_RULES.find(rule => rule.name === 'Camera Follow');
    if (follow) {
      // Which brings "Has a Camera" with it: this rule aims a camera and the
      // other one is what actually moves the view.
      current = importStockRule(current, follow).source;
    }

    const id = fileIdAt(current, `${target.path}.world`);
    if (!id) {
      return current;
    }
    return edit(current, id, contents =>
      cameraIn(contents)
        ? repoint(contents, answer)
        : append(contents, {type: 'world_world'}, [
            camera(answer),
            lookThrough(),
          ]),
    );
  },
};

/** What a world's follow camera is aimed at — exported for its test. */
export const followedIn = (contents: string): string | undefined =>
  aimedAt(cameraIn(contents));
