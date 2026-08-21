import {Attached, attachedTo} from './attachment.mjs';
import {
  anyOf,
  defineRule,
  moduleFor,
  moreThan,
  n,
  note,
  over,
  pick,
  thisActor,
  when,
} from './dsl.mjs';
import {health, mostHealth} from './health.mjs';
import {ShowsProgress, fraction} from './progress.mjs';

const rule = defineRule({
  name: 'Health Bar',
  ability: "Shows an Actor's Health",
  header: `// "Shows an Actor's Health" — the one line that joins three rules.
//
// It owns no state and draws nothing. Health has the number, Progress has the
// fraction a bar is drawn from, Attachment has the actor a rider is pointed
// at, and this is the sentence that says the three are about the same thing:
// my fraction is my subject's health out of its full.
//
// A RULE FOR ONE STEP, and that is the point rather than an embarrassment.
// The alternative is putting it in one of the three, and each is wrong in the
// same way: Health would have to know what a bar is, Progress would have to
// know what health is, and Attachment would have to know about both. Each of
// those is a core mechanic that a game may want without the other two. A
// fourth rule that requires all three costs a file and keeps them independent.
//
// IT READS THE ATTACHMENT rather than carrying a subject of its own, which is
// what makes pointing a bar once do both jobs: \`set attached to of ⟨any
// ⟨Health Bar⟩⟩ to ⟨this actor⟩\` puts it over that actor AND makes it show
// that actor's health. Two properties for one intention would be two chances
// to disagree, and a bar hovering over one thing while reporting another is a
// bug nobody would think to look for.
//
// IT RUNS IN \`sense\`, before anything decides anything, so the fraction it
// writes is the health as of the end of the last frame. Health's own step runs
// in \`react\`, and steps in one phase are unordered — reading there would be a
// race that works until the load order changes. A frame of lag on a bar cannot
// be seen; a race is a bug that turns up once a year.
//
// ZERO FULL IS ZERO, not a division. \`most health\` of nothing is a thing a
// learner can write, and a bar showing Infinity is worse than a bar showing
// empty.`,
});
rule.uses('Health');
rule.uses('Progress');
rule.uses('Attachment');

const shows = rule.trait('Shows Health');
// Both, because this trait is the join and neither half is optional: without
// the fraction there is nothing to write, and without the attachment there is
// nobody to read.
shows.uses(ShowsProgress);
shows.uses(Attached);

shows.step('follow the health', 'sense', [
  note('Pointed at nobody? Then leave the fraction as it was — a bar that'),
  note('nothing has attached shows what it was given, like any other.'),
  when([
    [
      anyOf(attachedTo.of(thisActor())),
      [
        fraction.set(
          thisActor(),
          pick(
            moreThan(mostHealth.of(attachedTo.of(thisActor())), n(0)),
            over(
              health.of(attachedTo.of(thisActor())),
              mostHealth.of(attachedTo.of(thisActor())),
            ),
            n(0),
          ),
        ),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'healthBar');
