import {setPosition} from './builtins.mjs';
import {defineRule, moduleFor, thisCamera} from './dsl.mjs';

const rule = defineRule({
  name: 'Camera',
  ability: 'Has a Camera',
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
  setPosition(thisCamera(), goal.x(thisCamera()), goal.y(thisCamera())),
]);

export default () => moduleFor(rule, 'camera');
