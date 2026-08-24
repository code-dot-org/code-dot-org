// A conversation walked, end to end.
//
// NOTHING IN THIS ENGINE SUSPENDS, so a script is not a sequence of blocks with
// pauses between them — it is a cursor and an event raised when it moves. That
// makes the rule almost entirely edge cases: what a click on the last line
// does, what starting twice does, where a jump may land. Each of them looks
// fine until the one playthrough that hits it.
//
// The project answers `moves to a line` and decides what line four IS, which is
// more words than a table of strings and is also the whole feature: a line can
// set a portrait, play a sound or ask a question, because it is blocks.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {importStockRule} from '../rules/importStockRule';
import {stockRuleByName} from '../rules/stock';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const me = () => ({block: {type: 'world_this_actor'}});
const num = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/**
 * A world holding one Label that is a three-line conversation.
 *
 * `how many lines` is the project's to set, because the project is what holds
 * the lines — a conversation cannot count what it cannot see.
 */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/label'},
            inputs: {
              DO: {
                block: {
                  type: 'world_add_trait',
                  fields: {TRAIT: 'Conversation#HasAConversationTrait'},
                  inputs: {ACTOR: me()},
                  next: {
                    block: {
                      type: 'world_set_Conversation_HowManyLinesProperty',
                      inputs: {ACTOR: me(), VALUE: num(3)},
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
});

const project = () => {
  const withLabel = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('label')!,
  ).source;
  const imported = importStockRule(
    withLabel,
    stockRuleByName('Conversation')!,
  ).source;
  const world = Object.values(imported.files).find(
    file => file.name === 'main.world',
  )!;
  return projectFiles({
    ...imported,
    files: {...imported.files, [world.id]: {...world, contents: WORLD}},
  });
};

/** Compile, and hand back the actor with the rule's members to drive it. */
const talk = async () => {
  const {world, modules} = await compileProject(project());
  const rule = modules['rules/conversation'] as unknown as Record<
    string,
    never
  >;
  const actor = [...world.actors][0];
  const lines: number[] = [];
  const ends: number[] = [];
  actor.on(rule.MovesToALineEvent, (_w, _a, value) =>
    lines.push(value as number),
  );
  actor.on(rule.EndsEvent, () => ends.push(1));
  return {
    world,
    actor,
    lines,
    ends,
    at: () => actor.get(rule.LineProperty) as number,
    // WORLD actions, not the actor's: a block that raises an event has to be
    // rule-scoped, because a trait's body is handed the actor alone and
    // `emit` needs the world. So they read `make ⟨who⟩ …`, as Jumping's does.
    //
    // Each is followed by a tick, because `emit` ENQUEUES — an event is
    // delivered on the next frame, not inside the action that raised it. In a
    // game that is invisible, the click and the frame being the same moment;
    // here it is the difference between an event list and an empty one.
    start: () => {
      world.act(rule.MakeStartTalkingAction, actor);
      world.tick(1 / 60);
    },
    next: () => {
      world.act(rule.MakeSayTheNextThingAction, actor);
      world.tick(1 / 60);
    },
    goTo: (which: number) => {
      world.act(rule.SendToLineAction, actor, which);
      world.tick(1 / 60);
    },
    stop: () => {
      world.act(rule.MakeStopTalkingAction, actor);
      world.tick(1 / 60);
    },
    talking: () => actor.query(rule.IsTalkingQuery),
    last: () => actor.query(rule.IsOnTheLastLineQuery),
  };
};

describe('walking a conversation', () => {
  it('says nothing until it is started', async () => {
    // Zero is nobody talking — a state it is in before it starts AND after it
    // ends, which is why a second flag is not needed to tell them apart.
    const chat = await talk();

    expect(chat.at()).toBe(0);
    expect(chat.talking()).toBe(false);
    expect(chat.lines).toEqual([]);
  });

  it('begins at line one and says so', async () => {
    const chat = await talk();

    chat.start();

    expect(chat.at()).toBe(1);
    expect(chat.talking()).toBe(true);
    // The event is what a project answers; without it the cursor moving would
    // be a number nobody reads.
    expect(chat.lines).toEqual([1]);
  });

  it('moves on, one line at a time', async () => {
    const chat = await talk();

    chat.start();
    chat.next();
    chat.next();

    expect(chat.at()).toBe(3);
    expect(chat.lines).toEqual([1, 2, 3]);
    expect(chat.ends).toEqual([]);
  });

  it('ends when the last line is clicked past', async () => {
    // The edge every dialogue system gets wrong once: a click on the last line
    // must END rather than move to a line that is not there.
    const chat = await talk();

    chat.start();
    chat.next();
    chat.next();
    expect(chat.last()).toBe(true);
    chat.next();

    expect(chat.at()).toBe(0);
    expect(chat.talking()).toBe(false);
    expect(chat.ends).toEqual([1]);
    // …and does not claim a fourth line on the way out.
    expect(chat.lines).toEqual([1, 2, 3]);
  });

  it('jumps where a choice sends it', async () => {
    // The whole of branching: a button's handler moves the cursor, and the
    // conversation carries on from there.
    const chat = await talk();

    chat.start();
    chat.goTo(3);

    expect(chat.at()).toBe(3);
    expect(chat.lines).toEqual([1, 3]);
    expect(chat.last()).toBe(true);
  });

  it('ends rather than landing somewhere there is no line', async () => {
    const chat = await talk();

    chat.start();
    chat.goTo(9);

    expect(chat.at()).toBe(0);
    expect(chat.ends).toEqual([1]);
  });

  it('ends rather than sitting before the first line', async () => {
    // `go to line 0` reads as "nowhere", and sitting silently at zero while
    // claiming to be talking is the state this rule exists to avoid.
    const chat = await talk();

    chat.start();
    chat.goTo(0);

    expect(chat.at()).toBe(0);
    expect(chat.ends).toEqual([1]);
  });

  it('can be stopped part way, and says it ended', async () => {
    const chat = await talk();

    chat.start();
    chat.next();
    chat.stop();

    expect(chat.at()).toBe(0);
    expect(chat.talking()).toBe(false);
    expect(chat.ends).toEqual([1]);
  });

  it('starts again from the top', async () => {
    // A conversation is not used up. Talking to the same character twice is
    // ordinary, and the cursor being plain state is what makes it free.
    const chat = await talk();

    chat.start();
    chat.next();
    chat.stop();
    chat.start();

    expect(chat.at()).toBe(1);
    expect(chat.lines).toEqual([1, 2, 1]);
  });

  it('is not on the last line when it is not talking', async () => {
    // Otherwise a handler asking "was that the last one?" before anybody spoke
    // gets a yes, and hides the box that was about to be used.
    const chat = await talk();

    expect(chat.last()).toBe(false);
  });
});
