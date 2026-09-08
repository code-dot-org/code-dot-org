// Words arriving a few letters at a time — the typewriter every game with
// dialogue has, as blocks a kind of actor declares for itself.
//
// IT WAS A RULE, `Reveals Text`, and nothing but a Speech Box ever elected it.
// What a rule buys is a mechanic several kinds share, that a world can ask
// about, that other rules depend on; this was one kind's, and the price of
// pretending otherwise was 40KB of generated workspace and a paragraph of
// wiring in every scene that wanted one.
//
// SO IT IS A PATCH INSTEAD, written here once and applied in two places: the
// stock Speech Box is built with it (`stock/speechBox`), and any actor with
// words can be given it (`enhance/typesOutText`). That is the whole reason
// this file exists rather than the rows living in the Speech Box — two
// tellings of the same six blocks are two things to keep in step, and the
// Health Bar's drawing is here for the same reason (`stock/progressBar`).
//
// WHAT IT IS, in the file it lands in:
//
//   define read-only string ⟨the whole line⟩     what is being said
//   define number ⟨letters a second⟩ = 20        reading pace
//   define event ⟨finishes revealing⟩            the cue somebody waits for
//   define block ⟨say ⟨words⟩⟩                   start a line
//   define block ⟨show all of it⟩                the impatient click
//   set ⟨timer runs⟩ of ⟨this actor⟩ to ⟨no⟩     nothing until something is said
//
//   when ⟨this actor⟩'s timer fires:             one letter per firing
//
// THE CLOCK IS TIME'S. The rule counted with `each frame` and a fractional
// letter count — `speed × delta` added up, because at twenty letters a second
// a sixtieth of a second is a third of a letter and rounding each frame would
// drift slow. A timer is that same idea already built and better: `Has a
// Timer` fires on a period, so a letter arrives per firing and there is no
// fraction to keep.
//
// AND THERE IS NO `letters shown`, which is the same saving one step further.
// `text` is the part of the line showing, so how much has arrived is how long
// `text` is — a second number would be a second answer to a question that
// already has one, and the two could disagree.
//
// EVERY BLOCK TYPE CARRIES THE DECLARING FILE (`ruleRegistry.pathSlug`), which
// is what keeps one kind's `say` apart from another's — so these rows cannot
// be a constant and are built for a module path instead. The Health Bar's step
// is parameterised for exactly the same reason.

import {pathSlug} from '../blockly/ruleRegistry';

import {
  chain,
  defineBlock,
  defineEvent,
  defineProperty,
  me,
  paramValue,
  setText,
  textOf,
  type BlockParam,
} from './stock/workspace';

/** The words a line is said with — `say ⟨words⟩`'s one parameter. */
export const TYPEWRITER_WORDS: BlockParam = {
  // Distinctive, because this is appended to files somebody else wrote and a
  // variable id already in use would be two parameters sharing one name.
  id: 'typewriter_words',
  name: 'words',
  type: 'string',
  binds: 'String',
};

/** Reading pace, in letters a second. */
const PACE = 20;

/**
 * The traits a typewriter needs elected.
 *
 * ONE, now that the words are the Label's own `define property` rows rather
 * than a rule's trait: a typewriter needs a clock, and whatever it is given to
 * already has words or there was nothing to reveal. A timer belongs to an
 * actor rather than to the world, because a game has several and they start
 * and stop apart (`rules/time`).
 */
export const TYPEWRITER_TRAITS: readonly string[] = ['Time#HasATimerTrait'];

/** `set ⟨timer runs⟩ of this actor to ⟨yes/no⟩`. */
const setTyping = (running: boolean) => ({
  type: 'world_set_Time_TimerRunsProperty',
  inputs: {
    ACTOR: me(),
    VALUE: {
      block: {
        type: 'logic_boolean',
        fields: {BOOL: running ? 'TRUE' : 'FALSE'},
      },
    },
  },
});

/** `⟨timer runs⟩ of this actor` — Time's, and a typewriter's "still typing". */
const stillTyping = () => ({
  block: {type: 'world_get_Time_TimerRunsProperty', inputs: {ACTOR: me()}},
});

/** How many characters `value` has. */
const lengthOf = (value: object) => ({
  block: {type: 'text_length', inputs: {VALUE: value}},
});

/**
 * The first `count` characters of `line`.
 *
 * Blockly's own substring block, pinned to the one shape a typewriter needs.
 * `AT1` is 1-based, which is Blockly's convention rather than ours: character
 * one is the first, and a count of zero gives the empty string.
 */
const firstCharacters = (line: object, count: object) => ({
  block: {
    type: 'text_getSubstring',
    fields: {WHERE1: 'FROM_START', WHERE2: 'FROM_START'},
    inputs: {
      STRING: line,
      AT1: {block: {type: 'math_number', fields: {NUM: 1}}},
      AT2: count,
    },
  },
});

const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const arithmetic = (op: string, a: object, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});
const compare = (op: string, a: object, b: object) => ({
  block: {type: 'logic_compare', fields: {OP: op}, inputs: {A: a, B: b}},
});
const onlyIf = (test: object, body: object[]) => ({
  type: 'controls_if',
  inputs: {IF0: test, DO0: {block: chain(body)}},
});

/** What a typewriter is, for the file that will hold it. */
export interface Typewriter {
  /** Rows for the `define actor` chain, in reading order. */
  rows: object[];
  /** `when ⟨this actor⟩'s timer fires` — a hat, and so a root of its own. */
  handler: object;
  /** The workspace variable `say ⟨words⟩` binds its parameter to. */
  variables: ReadonlyArray<{id: string; name: string; type: string}>;
  /** The block type of `say ⟨words⟩`'s call site, for a caller that names it. */
  sayBlock: string;
  /** …and of the hat, which is how "does this file have one" is answered. */
  firesBlock: string;
}

/**
 * A typewriter for the actor declared in `modulePath` — `actors/speechBox`.
 *
 * The path and not a prefix, because working the prefix out is
 * `ruleRegistry.pathSlug`'s job and two callers doing it by hand is two
 * chances to disagree with the palette about what a block is called.
 */
export function typewriterFor(modulePath: string): Typewriter {
  const own = pathSlug(modulePath);
  /** `⟨the whole line⟩ of this actor`. */
  const wholeLine = () => ({
    block: {
      type: `world_get_${own}_TheWholeLineProperty`,
      inputs: {ACTOR: me()},
    },
  });
  /** `set ⟨the whole line⟩ …` — read-only, so this file and nowhere else. */
  const setWholeLine = (value: object) => ({
    type: `world_set_${own}_TheWholeLineProperty`,
    inputs: {ACTOR: me(), VALUE: value},
  });
  /** `emit finishes revealing for this actor`. */
  const finished = () => ({
    type: `world_emit_${own}_FinishesRevealingEvent`,
    inputs: {ACTOR: me()},
  });

  return {
    sayBlock: `world_do_${own}_SayAction`,
    firesBlock: 'world_on_Time_TimerFiresEvent',
    variables: [
      {
        id: TYPEWRITER_WORDS.id,
        name: TYPEWRITER_WORDS.name,
        type: TYPEWRITER_WORDS.binds,
      },
    ],
    rows: [
      // The line being said. READ-ONLY: `say` is how a new one arrives, and it
      // clears what is showing in the same breath. Settable on its own, a
      // second line shorter than the first was never drawn at all — the actor
      // went on showing the line before, which is what the first scene with
      // two lines in it found.
      defineProperty('string', 'the whole line', '', {readonly: true}),
      // Reading pace. Read when a line STARTS, because `say` is what turns it
      // into the timer's period; changing it mid-sentence takes effect on the
      // next thing said.
      defineProperty('number', 'letters a second', String(PACE)),
      defineEvent('finishes revealing'),
      defineBlock({
        say: ['say', TYPEWRITER_WORDS],
        description:
          'Say a new line, from the beginning. The words arrive at reading pace.',
        body: [
          setWholeLine(paramValue(TYPEWRITER_WORDS)),
          // Nothing showing yet, which is what the first frame draws.
          setText('TextProperty', {
            block: {type: 'text', fields: {TEXT: ''}},
          }),
          // Letters a second is a PERIOD to the timer: a twentieth of a second
          // between letters is twenty of them a second.
          {
            type: 'world_set_Time_TimerPeriodProperty',
            inputs: {
              ACTOR: me(),
              VALUE: arithmetic('DIVIDE', number(1), {
                block: {
                  type: `world_get_${own}_LettersASecondProperty`,
                  inputs: {ACTOR: me()},
                },
              }),
            },
          },
          // And it runs. `next fire at` is behind the clock — either zero, or
          // the moment the last line finished — so the first letter comes on
          // the next frame rather than after a wait.
          setTyping(true),
        ],
      }),
      defineBlock({
        say: ['show all of it'],
        description:
          'Skip to the end of the line — for a reader who has read it faster than it is arriving.',
        body: [
          // Only while it is still arriving. Done twice, this would raise
          // `finishes revealing` a second time for a line that finished on its
          // own, and every handler waiting for the cue would run again.
          onlyIf(stillTyping(), [
            setText('TextProperty', wholeLine()),
            setTyping(false),
            finished(),
          ]),
        ],
      }),
      // STOPPED UNTIL SOMETHING IS SAID. A timer runs by default and fires on
      // its first frame, which would type whatever the actor already says out
      // of an empty `the whole line` and leave it blank.
      setTyping(false),
    ],
    handler: {
      // One letter per firing. The whole of the typewriter.
      type: 'world_on_Time_TimerFiresEvent',
      inputs: {ACTOR: me()},
      next: {
        block: chain([
          // One more character than is showing. `text` is the count, so there
          // is nothing else to keep in step with it.
          setText(
            'TextProperty',
            firstCharacters(
              wholeLine(),
              arithmetic('ADD', lengthOf(textOf('TextProperty')), number(1)),
            ),
          ),
          // …and the last one is the cue. Stopping the timer is what keeps
          // this from firing again, and so what makes the event happen once.
          onlyIf(
            compare(
              'GTE',
              lengthOf(textOf('TextProperty')),
              lengthOf(wholeLine()),
            ),
            [setTyping(false), finished()],
          ),
        ]),
      },
    },
  };
}
