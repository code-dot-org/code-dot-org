// What the actor demos CLAIM, asserted.
//
// The other half of a recording. A strip is a claim about what a stock actor
// does, frozen the day it was filmed; this is the test that fails on the day
// the actor stops doing it, which is what makes the recording worth trusting
// (specs/RULE_DEMOS.md, "Staleness, and the answer to it").
//
// It plays the same scene the recorder films, through the same `stage`, so
// there is nothing in between for the two to disagree about — and it asserts
// on the CELLS the recorder would draw as well as on the actor's position,
// because a demo whose subject is out of shot is a demo of an empty room.

import {beforeAll, describe, expect, it} from 'vitest';

import {PositionProperty} from '../../../engine';
import {ACTOR_DEMOS} from '../index';
import {
  actorDemoFrame,
  inFrame,
  stageActorDemo,
  stepActorDemo,
} from '../record/stage';
import type {ActorDemo} from '../types';

/** One recorded frame, as the assertions want to talk about it. */
interface Moment {
  seconds: number;
  /** The subject's id IN THE WORLD, which is generated rather than named. */
  subject: string;
  /** Where the subject was, in world pixels. */
  x: number;
  y: number;
  /** What the recorder would draw, in strip pixels. */
  drawn: ReturnType<typeof actorDemoFrame>;
}

/** Play a demo the way the recorder does, keeping what it would have drawn. */
async function playDemo(id: string, demo: ActorDemo): Promise<Moment[]> {
  const {world, subject} = await stageActorDemo(id, demo);
  const subjectId = (subject as unknown as {id: string}).id;
  const moments: Moment[] = [];
  for (let tick = 0; tick < Math.round(demo.seconds * 60); tick++) {
    stepActorDemo(world, demo, tick, () => {
      if (tick % 5 !== 0) {
        return;
      }
      const position = subject.get(PositionProperty);
      moments.push({
        seconds: tick / 60,
        subject: subjectId,
        x: position.x,
        y: position.y,
        drawn: actorDemoFrame(id, world),
      });
    });
  }
  return moments;
}

/** Compiled once per demo: staging one costs a whole project compile. */
const played = new Map<string, Moment[]>();
const play = async (id: string) => {
  if (!played.has(id)) {
    played.set(id, await playDemo(id, ACTOR_DEMOS[id]));
  }
  return played.get(id)!;
};

describe.each(Object.keys(ACTOR_DEMOS))('the %s demo', id => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play(id);
  }, 60000);

  it('draws its whole cast, every frame', () => {
    // `actorDemoFrame` throws for an actor it cannot draw, so reaching here at
    // all is half the check; the other half is that the scene is not empty.
    expect(moments.length).toBeGreaterThan(0);
    for (const moment of moments) {
      expect(moment.drawn.length).toBe(ACTOR_DEMOS[id].cast.length);
    }
  });

  it('keeps its subject in shot', () => {
    // The one thing a recording cannot recover from: an actor that leaves the
    // frame is filmed doing nothing at all, and the strip looks like a rule
    // that stopped working.
    const missing = moments.filter(
      moment =>
        !moment.drawn.some(cell => cell.id === moment.subject && inFrame(cell)),
    );
    expect(missing.map(moment => moment.seconds)).toEqual([]);
  });

  it('shows something happening', () => {
    // A demo whose every frame is identical is a still that costs forty times
    // as much to serve. Positions, because that is what these demos are about;
    // the rule side fingerprints everything drawn, because one of its demos
    // only ever changes its text.
    const places = new Set(moments.map(one => `${one.x},${one.y}`));
    expect(places.size).toBeGreaterThan(1);
  });
});

describe('the player demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('player');
  }, 60000);

  /** Where the subject was at that moment of the recording. */
  const at = (seconds: number) =>
    moments.reduce((best, one) =>
      Math.abs(one.seconds - seconds) < Math.abs(best.seconds - seconds)
        ? one
        : best,
    );

  it('walks right while the right arrow is held', () => {
    // The arrow keys, which are the first thing the actor's name promises.
    expect(at(1.0).x).toBeGreaterThan(at(0.4).x + 50);
    expect(at(0.3).x).toBeCloseTo(at(0.0).x, 5);
  });

  it('falls off the ledge, and lands on the ground', () => {
    // Gravity nobody asked for — the Player's file never names it, and gets it
    // through Jumping — and a Ground that catches what gravity drops.
    expect(at(1.3).y).toBeGreaterThan(at(0.9).y + 40);
    expect(at(1.5).y).toBeCloseTo(at(1.55).y, 5);
  });

  it('jumps when the space bar is tapped, and comes back down', () => {
    const floor = at(1.5).y;
    const apex = Math.min(...moments.map(one => one.y));
    expect(apex).toBeLessThan(floor - 100);
    expect(at(2.75).y).toBeCloseTo(floor, 5);
  });

  it('walks back the way it came', () => {
    // The left arrow, which is a different trait's business from the right one
    // and has been broken on its own before (specs/RULES.md, on Arrow Keys).
    expect(at(3.45).x).toBeLessThan(at(2.8).x - 50);
  });
});
