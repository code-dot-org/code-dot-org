// "Has a Conversation" — a line at a time, and the cursor that remembers which.
//
// Three lines said one after another, and then the box goes empty. What the
// rule holds is the NUMBER — line one, line two, nobody talking — and the
// words are the project's, which is why this demo keeps its own list and the
// speaker's text is set from it by the handler that answers "moves to a line".
//
// THE ENDING IS PART OF IT. A conversation that ran out of lines and sat on the
// last one for ever would be indistinguishable from one still talking, so the
// strip ends with the box empty: `ends` fired, and the project cleared the
// words in answer to it.
//
// The advance is scripted rather than clicked, because nobody is clicking in a
// recording; in a game it is a click, and it is the same one call.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` and by the script. */
let textOf: unknown;
let nextThing: unknown;
let speakerOf: unknown;
/** How many advances the script has asked for so far, this build. */
let said = 0;

/** The script. The rule counts the lines; a project is what holds them. */
const LINES = ['HELLO', 'NICE DAY', 'GOODBYE'];
const BEAT = 0.6;

export const conversationDemo: RuleDemo = {
  rules: ['rules/writing', 'rules/conversation'],
  // Three lines at 0.6s and then the box goes empty, with the empty box on
  // screen long enough to read as an ending rather than as a dropped frame.
  seconds: 2.4,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    textOf = of('rules/writing', 'TextProperty');
    nextThing = of('rules/conversation', 'MakeSayTheNextThingAction');
    said = 0;
    const world = demoWorld('conversation', modules, conversationDemo.rules);

    const speaker = new ActorBuilder({id: 'speaker', name: 'speaker'})
      .useTraits([
        of('rules/conversation', 'HasAConversationTrait'),
        of('rules/writing', 'ShowsTextTrait'),
      ])
      // The rule cannot count what it cannot see, so the project says how many
      // lines its script has.
      .set(of('rules/conversation', 'HowManyLinesProperty'), LINES.length)
      .set(PositionProperty, new Vector(96, 64))
      .instantiate('speaker');
    speakerOf = speaker;
    // The project's half, both ways round: the cursor moved, so say that line;
    // the conversation ended, so say nothing.
    speaker.on(
      of('rules/conversation', 'MovesToALineEvent'),
      (_world: unknown, _actor: unknown, line: unknown) => {
        speaker.set(textOf as never, LINES[(line as number) - 1] as never);
      },
    );
    speaker.on(of('rules/conversation', 'EndsEvent'), () => {
      speaker.set(textOf as never, '' as never);
    });
    world.addActor(speaker);

    world.act(
      of('rules/conversation', 'MakeStartTalkingAction'),
      speaker as never,
    );
    // …and the first line, written here as well as by the handler that is
    // about to write it. An event is delivered by a tick and the strip's first
    // cell is drawn before any tick has run — and that cell is the STILL every
    // unselected row shows, so a demo whose first frame is empty is a rule with
    // no picture (specs/RULE_DEMOS.md).
    speaker.set(textOf as never, LINES[0] as never);

    return {world, cast: {speaker}};
  },
  /**
   * The next line, on a beat.
   *
   * In `input` rather than on a Time timer because it is the player's click
   * that this stands for, and `input` is where a driver puts the hands. It
   * also keeps the demo to the two rules it is about.
   */
  input(world, seconds) {
    const due = Math.floor(seconds / BEAT);
    if (due > said) {
      said = due;
      world.act(nextThing as never, speakerOf as never);
    }
  },
  look(_id: string, actor: unknown) {
    return {
      width: 0,
      height: 0,
      color: '#abb2bf',
      text: (actor as {get(p: unknown): string}).get(textOf as never),
      textScale: 2,
    };
  },
};
