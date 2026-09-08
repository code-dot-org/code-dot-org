// The visual novel, READ.
//
// Three pieces meeting for the first time: `Conversation` keeps the place, the
// Speech Box types its own line out, and an inline tween brings the portrait
// on. None of them knows about the others, which is the property this
// exercises — a scene is composed rather than built into anything.
//
// Every way of getting a dialogue system wrong looks fine for the first line.
// So this plays the whole thing, both branches, to the end.

import {describe, expect, it} from 'vitest';

import {OpacityProperty, type World} from '../engine';
import {keyName} from '../engine/core/keys';
import {NOVEL_LINES} from '../fixtures/novel';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

/** Hold a key for a frame, then let what it started settle. */
const press = (world: World, key: string): void => {
  world.setInput([keyName(key)]);
  world.tick(1 / 60);
  world.setInput([]);
  for (let frame = 0; frame < 12; frame++) {
    world.tick(1 / 60);
  }
};

/** Let the typewriter finish whatever it is writing. */
const settle = (world: World): void => {
  for (let frame = 0; frame < 240; frame++) {
    world.tick(1 / 60);
  }
};

const scene = async () => {
  const {world, modules} = await compileProject(
    projectFiles(WORLD_SCENARIOS.novel.source),
  );
  const label = modules['actors/label'] as unknown as {TextProperty: never};
  const conversation = modules['rules/conversation'] as unknown as {
    LineProperty: never;
  };
  const actors = [...world.actors];
  // By KIND, and it used to be by trait. `text` was `Shows Text`'s and is the
  // stock Label's own property now, so there is no trait to ask about — and a
  // kind is not inherited, so the box is `actors/speechBox` rather than
  // anything that acts like a Label (specs/UI_ACTORS.md).
  const box = actors.find(
    actor => (actor as unknown as {type?: string}).type === 'actors/speechBox',
  )!;
  const portrait = actors.find(actor => actor !== box)!;
  return {
    world,
    box,
    portrait,
    said: () => box.get(label.TextProperty) as string,
    at: () => box.get(conversation.LineProperty) as number,
  };
};

describe('reading the novel', () => {
  it('says nothing of the script until somebody presses a key', async () => {
    // Beginning cannot happen as the world is BUILT — a world action wants a
    // running world — so the box shows the words it was made with, which reads
    // as a title card.
    const it_ = await scene();

    expect(it_.at()).toBe(0);
    expect(it_.said()).not.toBe(NOVEL_LINES[0]);
  });

  it('begins on the first press, and types the first line out', async () => {
    const it_ = await scene();

    press(it_.world, ' ');

    expect(it_.at()).toBe(1);
    // Part way through, which is the typewriter working — the whole line at
    // once would mean the box's own timer never fired.
    const shown = it_.said();
    expect(shown.length).toBeGreaterThan(0);
    expect(NOVEL_LINES[0].startsWith(shown)).toBe(true);

    settle(it_.world);

    expect(it_.said()).toBe(NOVEL_LINES[0]);
  });

  it('brings the portrait on with the first line', async () => {
    // An inline tween, because the Portrait's own `enters` is a `const` in its
    // own file and nothing outside can name it.
    const it_ = await scene();

    expect(it_.portrait.get(OpacityProperty)).toBe(0);

    press(it_.world, ' ');
    settle(it_.world);

    expect(it_.portrait.get(OpacityProperty)).toBe(1);
  });

  it('moves on a line at a time', async () => {
    const it_ = await scene();

    press(it_.world, ' ');
    settle(it_.world);
    press(it_.world, ' ');
    settle(it_.world);

    expect(it_.at()).toBe(2);
    expect(it_.said()).toBe(NOVEL_LINES[1]);
  });

  /** Read as far as the question. */
  const toTheQuestion = async () => {
    const it_ = await scene();
    for (let line = 0; line < 3; line++) {
      press(it_.world, ' ');
      settle(it_.world);
    }
    expect(it_.at()).toBe(3);
    return it_;
  };

  it('takes yes for an answer', async () => {
    const it_ = await toTheQuestion();

    press(it_.world, 'ArrowLeft');
    settle(it_.world);

    expect(it_.at()).toBe(4);
    expect(it_.said()).toBe(NOVEL_LINES[3]);
  });

  it('takes no for one too', async () => {
    const it_ = await toTheQuestion();

    press(it_.world, 'ArrowRight');
    settle(it_.world);

    expect(it_.at()).toBe(5);
    expect(it_.said()).toBe(NOVEL_LINES[4]);
  });

  it('rejoins the ending from either answer', async () => {
    // What converging branches cost: the line after the yes-answer is the
    // no-answer, so the space bar has to jump rather than step. Both routes
    // must arrive at the same last line, and neither may fall into the other's.
    for (const answer of ['ArrowLeft', 'ArrowRight']) {
      const it_ = await toTheQuestion();

      press(it_.world, answer);
      settle(it_.world);
      press(it_.world, ' ');
      settle(it_.world);

      expect(it_.at()).toBe(NOVEL_LINES.length);
      expect(it_.said()).toBe(NOVEL_LINES[NOVEL_LINES.length - 1]);
    }
  });

  it('takes the portrait away at the end, and stops', async () => {
    const it_ = await toTheQuestion();

    press(it_.world, 'ArrowLeft');
    settle(it_.world);
    press(it_.world, ' ');
    settle(it_.world);

    expect(it_.portrait.get(OpacityProperty)).toBe(0);

    // One more press runs off the end, which ends the conversation rather than
    // moving to a line that is not there.
    press(it_.world, ' ');

    expect(it_.at()).toBe(0);
  });
});
