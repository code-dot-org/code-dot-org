import {setPosition} from './builtins.mjs';
import {defineRule, doc, moduleFor, thisCamera} from './dsl.mjs';

const rule = defineRule({
  name: 'Camera',
  ability: 'Has a Camera',
  purpose: `**Camera** is the base every other camera rule is built on. On its own it does
almost nothing, and that is the point.

It owns one idea: the *goal*, where the camera wants to look. Every rule that
decides where to look writes the goal, and this one moves the camera there. So
following, easing, deadzones and limits can all be switched on together without
any of them knowing about the others.

Give a camera **Aimed** and then add whichever of those you want.`,
  header: `// "Has a Camera", the base every camera rule builds on.
//
// It owns two things and nothing else: a GOAL — where the camera wants to look
// — and the one step that acts on it, which moves the camera there. Everything
// that decides where to look writes the goal and never touches the position,
// so any number of such rules compose without knowing about each other.
//
// The goal PERSISTS, which is what makes this safe on its own: a camera nothing
// aims keeps last frame's goal, which is where it already is, and "take the
// view" moves it nowhere. There is nothing to initialise.`,
});

const aimed = rule.trait('Aimed', 'camera');
export const goal = aimed.point('goal', {x: 0, y: 0});
export const Aimed = rule.traitRef('Aimed');

aimed.step('take the view', 'view', [
  doc(
    '**The last word.** Every other camera step writes to `goal`, which is a wish rather than a place; this is the one that moves the view to it.\n\nDoing it last, in a moment of its own, is what lets the other steps be written independently — aim, then steady, then smooth, then confine. Each reads the goal the one before it left, and none of them has to know which of the others the project turned on.',
  ),
  setPosition(thisCamera(), goal.x(thisCamera()), goal.y(thisCamera())),
]);

export default () => moduleFor(rule, 'camera');
