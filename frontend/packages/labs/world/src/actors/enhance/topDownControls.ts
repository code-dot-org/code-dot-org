// "Moves in all four directions" — the controls a game seen from above wants.
//
// THE SHELF HAD ONE MOVEMENT ROW AND IT WAS A PLATFORMER'S. Walking, jumping,
// gravity: everything a learner needs for a side-on game and nothing at all for
// one seen from above, where there is no floor to stand on and up is a
// direction rather than a leap. A maze, a top-down adventure, anything played
// on a board was a game the step could not start.
//
// BOTH AXES, which is the whole difference from `enhance/platformerControls`.
// That one elects `Moves Across` and leaves the vertical to Gravity and a jump
// key; this elects across AND down, and nothing pulls the actor anywhere. The
// two rows are the same rule read two ways, which is why they are two rows
// rather than a question under one: "what kind of game is this" is answered by
// picking one, not by answering a sub-question about one.
//
// NO GRAVITY, said out loud because it is the thing most likely to be added by
// mistake. An actor that both walks up and falls down is an actor that walks up
// and is dragged back, and the row that does that already exists for the
// learner who wants it (`enhance/falls`).
//
// NO HANDLER EITHER, unlike the platformer's, which binds space to a jump. The
// arrow keys are the rule's own business — `Moves Across` and `Moves Down` read
// them directly — so this row is three `use trait` lines and the rules they
// come from, and there is nothing to check but whether they are worn.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const ACROSS = 'Arrow Keys#MovesAcrossTrait';
const DOWN = 'Arrow Keys#MovesDownTrait';
/** The same keyboard trait the platformer's controls take, for one reason. */
const KEYBOARD = 'Input#TakesKeyboardInputTrait';

const TRAITS = [ACROSS, DOWN, KEYBOARD];
const RULES = ['Arrow Keys', 'Input'];

export const topDownControlsEnhancement: Enhancement = {
  id: 'top-down-controls',
  subject: 'actor',
  name: 'Moves in all four directions',
  description:
    'Gives this actor the controls a game seen from above wants: the left and right arrows move it across, and the up and down arrows move it up and down the screen. Nothing pulls it anywhere — there is no floor in a game seen from above — so an actor with these walks where it is told and stays there. How fast it goes is a block in its file. An actor in a side-on game wants “Walks and jumps like a platformer” instead.',
  brings: ['Moves Across', 'Moves Down', 'Reads the Keyboard'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return TRAITS.every(trait => wears(contents, trait, root));
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, RULES);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, TRAITS));
  },
};
