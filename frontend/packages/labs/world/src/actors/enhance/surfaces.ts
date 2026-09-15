// Floors that do something to you — three of them, and the walker who notices.
//
// A floor in this library holds you up and nothing else. A platformer is built
// out of several: a belt that carries you along, ice you cannot stop on,
// sludge that drags (`rules/stock/surfaces`).
//
// ONE OF THE THREE, never two. The rule's own words: a tile takes one, or none
// and stays an ordinary floor. They are three answers to "what is this floor
// like" rather than three things a floor can accumulate, and a tile wearing
// two would have two rules arguing over the same walker every frame. So each
// row refuses a floor that already has one of the others, and says which —
// which is why a refusal is given the project to read.
//
// AND THE WALKER HAS TO NOTICE. `Stands on Surfaces` is what makes any of this
// visible, and it names no floor, so one walker notices every kind. Each row
// asks who walks on it and writes that trait into their file, the way the
// moving platform names its passenger (`enhance/carries`) — a floor made
// slippery in a game where nothing stands on surfaces is a floor that behaves
// exactly as it did.
//
// …AND THE OTHER END HAS ITS OWN ROW. A learner making the PLAYER in a project
// that already has ice takes "Walks on special floors", which is one trait and
// no question, and is offered only once there is a special floor to walk on.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {actorChoices, targetOf} from './actorChoices';
import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const CONVEYS = 'Surfaces#ConveysTrait';
const SLIPPERY = 'Surfaces#SlipperyTrait';
const SLOWS = 'Surfaces#SlowsTrait';
export const STANDS = 'Surfaces#StandsOnSurfacesTrait';

/** What each floor trait is called where a learner reads it. */
const CALLED: Record<string, string> = {
  [CONVEYS]: 'a conveyor belt',
  [SLIPPERY]: 'slippery',
  [SLOWS]: 'slow going',
};

const contentsOf = (source: MultiFileSource, target: EnhanceTarget) => {
  const {path, root} = fileOf(target);
  const id = fileIdAt(source, path);
  return {contents: id ? source.files[id].contents : '', root};
};

/** Whether the walker named by `answer` notices floors at all. */
const notices = (
  source: MultiFileSource,
  _target: EnhanceTarget,
  answer: string,
): boolean => {
  const {contents, root} = contentsOf(source, targetOf(answer));
  return wears(contents, STANDS, root);
};

/**
 * One of the three, as a row.
 *
 * The three differ in a word and a sentence and in nothing else, so they are
 * made rather than written out — and what a reader needs to compare is exactly
 * those two things, side by side.
 */
const floorRow = (
  id: string,
  trait: string,
  name: string,
  description: string,
): Enhancement => {
  const others = [CONVEYS, SLIPPERY, SLOWS].filter(one => one !== trait);
  return {
    id,
    subject: 'actor',
    name,
    description,
    brings: [name.replace(/^Is /, ''), 'Stands on Surfaces, on the walker'],
    refuse(source: MultiFileSource, target: EnhanceTarget) {
      const {contents, root} = contentsOf(source, target);
      const worn = others.find(one => wears(contents, one, root));
      return worn
        ? `This floor is already ${CALLED[worn]}, and a floor is one kind.`
        : undefined;
    },
    asks: {
      label: 'Walked on by',
      options: actorChoices,
    },
    applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
      const {contents, root} = contentsOf(source, target);
      return (
        wears(contents, trait, root) &&
        (answer === undefined || notices(source, target, answer))
      );
    },
    apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
      if (answer === undefined) {
        return source;
      }
      let current = importRules(source, ['Surfaces']);

      const floor = fileOf(target);
      const floorId = fileIdAt(current, floor.path);
      if (floorId !== undefined) {
        current = edit(current, floorId, contents =>
          electTraits(contents, floor.root, [trait]),
        );
      }

      const walker = fileOf(targetOf(answer));
      const walkerId = fileIdAt(current, walker.path);
      if (walkerId !== undefined) {
        current = edit(current, walkerId, contents =>
          electTraits(contents, walker.root, [STANDS]),
        );
      }
      return current;
    },
  };
};

export const conveysEnhancement = floorRow(
  'conveys',
  CONVEYS,
  'Is a conveyor belt',
  'Makes this floor carry whatever stands on it along, at a speed that is a block in its file — a belt in a factory, a current in a river. Standing still on one is not standing still. Set the speed negative and it runs the other way.',
);

export const slipperyEnhancement = floorRow(
  'slippery',
  SLIPPERY,
  'Is slippery',
  'Makes this floor ice: whatever walks on it keeps going after the key is let go, and takes a moment to get moving in the first place. How slippery is a block in its file. Jumping still works — none of the special floors touches the vertical.',
);

export const slowsEnhancement = floorRow(
  'slows',
  SLOWS,
  'Is slow going',
  'Makes this floor drag: whatever walks on it moves at a fraction of its usual speed, which is a block in its file — mud, sand, deep water. The fraction is of the walker’s own speed, so a fast thing crossing it is still faster than a slow one.',
);

export const walksOnSurfacesEnhancement: Enhancement = {
  id: 'walks-on-surfaces',
  subject: 'actor',
  name: 'Walks on special floors',
  description:
    'Lets this actor notice the floors that do something: it is carried by a conveyor belt, it slides on ice, it is slowed by sludge. It names no floor, so whatever it steps onto next treats it the same way. Without this, a special floor is an ordinary one.',
  brings: ['Stands on Surfaces'],
  offered: (source: MultiFileSource) =>
    Object.values(source.files).some(file =>
      [CONVEYS, SLIPPERY, SLOWS].some(one =>
        (file.contents ?? '').includes(one),
      ),
    ),
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {contents, root} = contentsOf(source, target);
    return wears(contents, STANDS, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Surfaces']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, [STANDS]));
  },
};
