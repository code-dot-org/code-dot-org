import {CanMove, velocity} from './builtins.mjs';
import {
  add,
  allWithTrait,
  axisOf,
  defineRule,
  forEach,
  keyDown,
  moduleFor,
  n,
  note,
  pick,
  times,
  vector,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Arrow Keys',
  ability: 'Moves with Arrow Keys',
  header: `// "Moves with Arrow Keys" — the first mechanic a learner meets.
//
// It turns a held key into sideways velocity, which is what \`decide\` is:
// intent becomes motion, before anything pushes and before Physics turns
// velocity into position. It used to say that as "before Physics > reposition",
// which meant naming another rule in order to describe itself.`,
});
rule.uses('Physics');

const controlled = rule.trait('Controlled by Arrow Keys');
controlled.uses(CanMove);
const moveSpeed = controlled.number('move speed', 1.5);

const each = rule.local('each', 'Actor');

/** The speed to walk at while `key` is held, and nothing while it is not. */
const whileHeld = (key, speed) => pick(keyDown(key), speed, n(0));

rule.step('control', 'decide', [
  forEach(each, {
    from: allWithTrait(rule.traitRef('Controlled by Arrow Keys')),
    body: [
      note(
        'While an arrow is held, walk that way; while it is not, stand still.',
      ),
      note('Holding both at once cancels out, because we add the two amounts.'),
      note('We only set sideways speed — up and down belongs to gravity.'),
      velocity.set(
        each.get(),
        vector(
          add(
            whileHeld('right arrow', moveSpeed.of(each.get())),
            whileHeld('left arrow', times(moveSpeed.of(each.get()), n(-1))),
          ),
          axisOf('y', velocity.of(each.get())),
        ),
      ),
    ],
  }),
]);

export default () => moduleFor(rule, 'arrows');
