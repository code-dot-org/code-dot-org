// A conversation, with a portrait and a choice — the visual novel.
//
// The scenario the dialogue pieces were built for, and the one that says
// whether they meet: `Conversation` keeps the place, the Speech Box types its
// own line out a few letters at a time, and neither knows about the other.
//
// THE SCRIPT IS BLOCKS, which is the whole bargain. A line is not a string in a
// table: line one brings a portrait on, line three waits for an answer, line
// six takes the portrait away. That is more blocks than a file of lines would
// be, and it is why a file of lines could not have come first — nothing yet
// knew what a line needed to be able to do.
//
// WHAT IT COSTS IS VISIBLE HERE TOO. Branches that converge need a guard on the
// advance key, because "the next line" after the yes-answer is the no-answer.
// Six lines and it is already the fiddliest block in the file; that is the
// argument for a `.dialogue` file, made by writing one without.

import {labelActor} from '../actors/stock/label';
import {portraitActor} from '../actors/stock/portrait';
import {speechBoxActor} from '../actors/stock/speechBox';
import {
  buildProject,
  stack,
  starterSprites,
  type ProjectSpec,
} from '../constants';
import {referenceToStock} from '../rules/ruleReference';

import {me, number} from './meteors';

/** The script. The index in this list is the line number, one-based. */
const LINES = [
  'The door creaks open. Someone is standing in the hall.',
  '“You came,” she says. “I wasn’t sure that you would.”',
  'Answer her? Press the LEFT arrow for yes, the RIGHT arrow for no.',
  '“I said I would.” She looks at the floor, and then at you.',
  'You say nothing at all. The hall is very quiet.',
  'The door closes behind you, and that is that.',
];

/** Where the two branches meet again. */
const ENDING = 6;

const box = () => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/speechBox'}},
});
const portrait = () => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/portrait'}},
});

const lineOf = (who: object) => ({
  block: {
    type: 'world_get_Conversation_LineProperty',
    inputs: {ACTOR: who},
  },
});

const isLine = (which: number) => ({
  block: {
    type: 'logic_compare',
    fields: {OP: 'EQ'},
    inputs: {A: lineOf(box()), B: number(which)},
  },
});

/**
 * `say ⟨words⟩ on ⟨the box⟩` — a new line, from the beginning.
 *
 * The ACTION and not a write to `text`, because saying a line and showing one
 * are different things: `say` puts the line away whole and starts the clock
 * that lets it out. Writing `text` is what the box is DRAWING right now, which
 * the typewriter overwrites on its next letter.
 */
const say = (words: string, who: object = box()) => ({
  type: 'world_do_ActorsSpeechBox_SayAction',
  inputs: {
    ACTOR: who,
    VALUE: {block: {type: 'text', fields: {TEXT: words}}},
  },
});

/**
 * What the box says before anybody has pressed anything.
 *
 * SAID, and not left to the Speech Box's own default: the box ships with
 * "Once upon a time…" written into it, and a hall nobody has entered yet is
 * not that.
 */
const TITLE = 'The Hall. Press SPACE to begin.';

/**
 * A fade, written where it is used.
 *
 * The Portrait ships none of its own, and this is why: a definition is
 * reachable only from the file it sits in, and WHEN a character comes on is
 * the scene's decision. So the fade lives on the line that causes it.
 */
const fade = (who: object, to: number, seconds: number) => ({
  type: 'world_play_tween_here',
  fields: {CURVE: 'ending slowly'},
  inputs: {
    ACTOR: who,
    SECONDS: number(seconds),
    DO: {
      block: {
        type: 'world_set_Appearance_OpacityProperty',
        inputs: {ACTOR: me(), VALUE: number(to)},
      },
    },
  },
});

/** One `if` per line: what this line SAYS, and anything else it does. */
const scriptFor = (): object => {
  const branches = LINES.map((words, at) => {
    const body: object[] = [say(words)];
    if (at === 0) {
      // The portrait arrives with the first line, and not before: it starts
      // invisible so that its own entrance can be seen.
      body.push(fade(portrait(), 1, 0.4));
    }
    if (at === LINES.length - 1) {
      body.push(fade(portrait(), 0, 0.3));
    }
    return {test: isLine(at + 1), body};
  });
  // Chained `else if`, which is what `controls_if` with several branches is.
  return {
    type: 'controls_if',
    extraState: {elseIfCount: branches.length - 1},
    inputs: Object.fromEntries(
      branches.flatMap((branch, at) => [
        [`IF${at}`, branch.test],
        [`DO${at}`, {block: stack(branch.body)}],
      ]),
    ),
  };
};

/**
 * What a key does, which is where converging branches cost something.
 *
 * On the choice line the arrows pick a branch. On either branch's line the next
 * press has to JUMP to the ending, because the line after the yes-answer is the
 * no-answer. Everywhere else the space bar simply moves on.
 */
const controls = (key: string, y: number, body: object[]) => ({
  type: 'world_on_Input_IsPressedEvent',
  fields: {FILTER0: key},
  x: 420,
  y,
  next: {block: stack(body)},
});

/**
 * A designed block with ONE parameter takes the DEFAULT socket name.
 *
 * `make ⟨…⟩ say the next thing` has one, so its socket is `VALUE`; `send ⟨…⟩ to
 * line ⟨…⟩` has two, so they are `WHO` and `WHICH`. Not guessable, and the
 * palette answers it in twenty lines (AGENTS.md).
 */
const sayNext = () => ({
  type: 'world_do_Conversation_MakeSayTheNextThingAction',
  inputs: {VALUE: box()},
});

const goTo = (which: number) => ({
  type: 'world_do_Conversation_SendToLineAction',
  inputs: {WHO: box(), WHICH: number(which)},
});

const MAIN_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'The Hall'},
        next: {
          block: stack([
            {
              type: 'world_set_map_size',
              inputs: {X: number(10), Y: number(10)},
            },
            {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/portrait'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_set_position',
                    inputs: {ACTOR: me(), X: number(160), Y: number(110)},
                  },
                },
              },
            },
            {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/speechBox'},
              inputs: {
                DO: {
                  block: stack([
                    {
                      type: 'world_set_position',
                      inputs: {ACTOR: me(), X: number(160), Y: number(250)},
                    },
                    // The ability that makes it a talking box rather than a
                    // panel with words on it: `Conversation` keeps the place
                    // in the script. Typing the line out is the box's own
                    // (`actors/stock/speechBox`).
                    {
                      type: 'world_add_trait',
                      fields: {TRAIT: 'Conversation#HasAConversationTrait'},
                      inputs: {ACTOR: me()},
                    },
                    {
                      type: 'world_set_Conversation_HowManyLinesProperty',
                      inputs: {ACTOR: me(), VALUE: number(LINES.length)},
                    },
                    // On `me()` and not on `the ⟨Speech Box⟩`: the box being
                    // dressed is not in the world yet, so a lookup by kind has
                    // nothing to find. Everything else in this body says the
                    // same thing.
                    say(TITLE, me()),
                  ]),
                },
              },
            },
          ]),
        },
      },
      // The script: one branch per line, answering the move.
      {
        type: 'world_on_Conversation_MovesToALineEvent',
        x: 20,
        y: 320,
        inputs: {ACTOR: box()},
        next: {block: scriptFor()},
      },
      // Space begins it, and then moves it on.
      //
      // BEGINNING IS THE PLAYER'S. A world's setup can act now
      // (`WorldBuilder.act`), so `make ⟨…⟩ start talking` up there would work
      // — and a scene that has already spoken its first line before anybody
      // has touched a key is not a scene you can open. So the box is handed a
      // title card instead, and the first press starts the talk.
      controls('space', 60, [
        {
          type: 'controls_if',
          extraState: {hasElse: true},
          inputs: {
            IF0: {
              block: {
                type: 'world_query_Conversation_IsTalkingQuery',
                inputs: {ACTOR: box()},
              },
            },
            DO0: {
              block: {
                type: 'controls_if',
                extraState: {hasElse: true},
                inputs: {
                  // Where converging branches cost something: the line after
                  // the yes-answer is the no-answer, so rejoining is a jump.
                  IF0: {
                    block: {
                      type: 'logic_operation',
                      fields: {OP: 'OR'},
                      inputs: {A: isLine(4), B: isLine(5)},
                    },
                  },
                  DO0: {block: goTo(ENDING)},
                  ELSE: {block: sayNext()},
                },
              },
            },
            ELSE: {
              block: {
                type: 'world_do_Conversation_MakeStartTalkingAction',
                inputs: {VALUE: box()},
              },
            },
          },
        },
      ]),
      // The choice, which is the whole of branching: a key moves the cursor.
      controls('left arrow', 260, [
        {
          type: 'controls_if',
          inputs: {IF0: isLine(3), DO0: {block: goTo(4)}},
        },
      ]),
      controls('right arrow', 420, [
        {
          type: 'controls_if',
          inputs: {IF0: isLine(3), DO0: {block: goTo(5)}},
        },
      ]),
    ],
  },
});

const SPEC: ProjectSpec = {
  folders: ['worlds', 'actors', 'rules', 'sprites'],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: MAIN_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    // The Label the Speech Box ACTS LIKE. `acts like` names a module path, and
    // a path naming a file the project does not hold inherits nothing at all —
    // no words, no box, no picture (`actors/stock/speechBox`).
    label: {
      name: 'label.actor',
      language: 'actor',
      contents: labelActor,
      folderId: 'actors',
    },
    speechBox: {
      name: 'speechBox.actor',
      language: 'actor',
      contents: speechBoxActor,
      folderId: 'actors',
    },
    portrait: {
      name: 'portrait.actor',
      language: 'actor',
      contents: portraitActor,
      folderId: 'actors',
    },
    'rule-writing': {
      name: 'writing.rule',
      language: 'rule',
      contents: referenceToStock('writing'),
      folderId: 'rules',
    },
    'rule-time': {
      name: 'time.rule',
      language: 'rule',
      contents: referenceToStock('time'),
      folderId: 'rules',
    },
    'rule-conversation': {
      name: 'conversation.rule',
      language: 'rule',
      contents: referenceToStock('conversation'),
      folderId: 'rules',
    },
    'rule-input': {
      name: 'input.rule',
      language: 'rule',
      contents: referenceToStock('input'),
      folderId: 'rules',
    },
    ...starterSprites(['player']),
  },
  open: ['main'],
};

export const NOVEL = buildProject(SPEC);
export const NOVEL_LINES = LINES;
