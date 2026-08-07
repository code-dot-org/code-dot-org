import {Aimed, goal} from './camera.mjs';
import {
  axisOf,
  defineRule,
  give,
  lessThan,
  mapSize,
  minus,
  moduleFor,
  moreThan,
  n,
  over,
  param,
  thisCamera,
  viewSize,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Camera Confined',
  ability: 'Keeps the View in the Map',
  header: `// "Keeps the View in the Map" — the camera stops at the edge of the level.
//
// The spec's promise: walk to the left-most part of the map and the camera
// locks there, showing the left edge, until you have moved far enough right for
// it to follow again (specs/VIEWPORT.md).
//
// It clamps the GOAL, in \`confine\`, after anything that aimed or smoothed and
// before Camera takes the view. So it composes with easing without either
// knowing the other: what it hands on is somewhere legal, and what it was
// handed can be anything.
//
// The bounds are the MAP's, read rather than typed: a camera position is the
// middle of the view (core/Camera), so the view's edge stops at the map's edge
// when the position is kept half a screen inside it. Nothing here restates a
// number the map editor already knows.
//
// The clamp is a block this rule adds, for the reason \`rules/solid\` adds its
// own: written out twice inline it is a nest of comparisons, and named once it
// is a sentence.`,
});
rule.uses('Camera');

const kept = rule.block({
  returns: 'number',
  description:
    'A number pushed back inside a range: never below the low end, never above the high one.',
  say: [param('value'), 'kept between', param('low'), 'and', param('high')],
  body: ({value, low, high}) => [
    when([
      [lessThan(value, low), [give(low)]],
      [moreThan(value, high), [give(high)]],
    ]),
    give(value),
  ],
});

const confinedTrait = rule.trait('Confined to the Map', 'camera');
confinedTrait.uses(Aimed);

/** Half the view, so the EDGE of the view stops at the edge of the map. */
const half = which => over(axisOf(which, viewSize()), n(2));

const confined = which =>
  kept({
    value: goal.axis(which, thisCamera()),
    low: half(which),
    high: minus(axisOf(which, mapSize()), half(which)),
  });

confinedTrait.step('keep the view inside', 'confine', [
  goal.set(thisCamera(), confined('x'), confined('y')),
]);

export default () => moduleFor(rule, 'cameraConfined');
