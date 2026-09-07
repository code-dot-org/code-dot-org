// "Reveals Text" — a line that arrives a letter at a time.
//
// The rule a still cannot show at all: a frozen frame of a typewriter is a
// half-written sentence, which is what a half-written sentence looks like
// whether or not anything is writing it. In motion it is unmistakable, and the
// strip is the letters landing one after another.
//
// TWO LINES, because the second half of the rule is the impatient click. The
// top one types at its own pace all the way through; the bottom one is told to
// show all of it a second in, and finishes in one frame. A learner reading the
// two rows sees both the waiting and the escape from it.
//
// The words are drawn from Writing's `text`, which is where this rule puts
// them: it owns the count and paints nothing (`rules/reveals`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` and by the skip. */
let textOf: unknown;
let showAll: unknown;
let impatient: unknown;

const LINE = 'HELLO WORLD';
/** When the impatient one is told to stop waiting. */
const SKIP_AT = 1;

export const revealsDemo: RuleDemo = {
  rules: ['rules/writing', 'rules/reveals'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    textOf = of('rules/writing', 'TextProperty');
    showAll = of('rules/reveals', 'ShowAllOfItAction');
    const world = demoWorld('reveals', modules, revealsDemo.rules);

    const speaker = (id: string, y: number) => {
      const actor = new ActorBuilder({id, name: id})
        .useTraits([of('rules/reveals', 'RevealsTextTrait')])
        // Slow enough that eleven letters take most of the strip: a line that
        // arrives in three frames is a line that appears.
        .set(of('rules/reveals', 'LettersASecondProperty'), 5)
        .set(PositionProperty, new Vector(96, y))
        .instantiate(id);
      world.addActor(actor);
      actor.act(of('rules/reveals', 'SayAction'), LINE as never);
      return actor;
    };
    const patient = speaker('patient', 48);
    impatient = speaker('impatient', 88);

    return {world, cast: {patient, impatient}};
  },
  /**
   * The skip, on a clock rather than on a click.
   *
   * `input` is where a driver puts the player's hands, and a player who has
   * read the line and wants the rest of it is exactly what this stands for —
   * so it goes where the hands go rather than in a handler pretending to be
   * one.
   */
  input(_world, seconds) {
    if (seconds >= SKIP_AT && seconds < SKIP_AT + 1 / 60) {
      (impatient as {act(action: unknown): void}).act(showAll);
    }
  },
  look(id: string, actor: unknown) {
    const words = (actor as {get(p: unknown): string}).get(textOf as never);
    return {
      width: 0,
      height: 0,
      color: id === 'patient' ? '#abb2bf' : '#98c379',
      text: words,
      textScale: 2,
    };
  },
};
