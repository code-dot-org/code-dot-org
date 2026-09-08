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
import {KNOWN} from '../../../rules/demos/record/font';
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
  const staged = await stageActorDemo(id, demo);
  const {world, subject} = staged;
  const subjectId = (subject as unknown as {id: string}).id;
  const moments: Moment[] = [];
  for (let tick = 0; tick < Math.round(demo.seconds * 60); tick++) {
    stepActorDemo(staged, demo, tick, () => {
      if (tick % 5 !== 0) {
        return;
      }
      const position = subject.get(PositionProperty);
      moments.push({
        seconds: tick / 60,
        subject: subjectId,
        x: position.x,
        y: position.y,
        drawn: actorDemoFrame(id, world, demo, tick / 60),
      });
    });
  }
  return moments;
}

/**
 * Everything a frame draws, as one comparable string.
 *
 * The pixels of a picture are left out — they are the same bytes every frame,
 * and a signature carrying them would be megabytes of identical noise. WHICH
 * cell of a sheet is in, because that is a coin spinning.
 */
const signature = (moment: Moment): string =>
  JSON.stringify(
    moment.drawn.map(cell =>
      'pixels' in cell
        ? {
            id: cell.id,
            x: cell.x,
            y: cell.y,
            width: cell.width,
            height: cell.height,
            flip: cell.flip,
            opacity: cell.opacity,
            source: cell.source,
          }
        : cell,
    ),
  );

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
    // A demo with a pointer draws a cursor as well, which is not an actor.
    const drawn =
      ACTOR_DEMOS[id].cast.length + (ACTOR_DEMOS[id].pointer ? 1 : 0);
    expect(moments.length).toBeGreaterThan(0);
    for (const moment of moments) {
      expect(moment.drawn.length).toBe(drawn);
    }
  });

  it('draws its subject where the demo put it', () => {
    // The frame's arithmetic, checked once: a demo says where its actors go in
    // WORLD pixels and the recorder draws in strip pixels, and the number
    // between them is the demo's own `shrink`. Reading the default there
    // instead drew every scene that chose one at half the distance from the
    // corner — which looks like a composition somebody meant, in every strip
    // it happened to.
    const demo = ACTOR_DEMOS[id];
    const placed = demo.cast.find(one => one.actor === id)!;
    const shrink = demo.shrink ?? 2;
    const drawn = moments[0].drawn.find(
      cell => cell.id === moments[0].subject,
    )!;
    expect(drawn.x).toBeCloseTo(placed.x / shrink, 5);
    expect(drawn.y).toBeCloseTo(placed.y / shrink, 5);
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
    // as much to serve.
    //
    // EVERYTHING DRAWN, not the subject's position. Position was the first
    // draft and it was too narrow the moment the drawn actors arrived: a
    // Label counting up and a Progress Bar filling never move one pixel, and
    // what changes about them is the picture. The rule side learned this the
    // same way, from Writing.
    const seen = new Set(moments.map(signature));
    expect(seen.size).toBeGreaterThan(1);
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

/** The drawing a moment shows for `id`, for a demo whose actor draws itself. */
const drawingIn = (moment: Moment, id?: string) => {
  const cell = moment.drawn.find(
    one => 'commands' in one && (id === undefined || one.id === id),
  );
  if (!cell || !('commands' in cell)) {
    throw new Error('that moment drew no drawing');
  }
  return cell;
};

/** The text a drawing puts on the screen, in the order it draws it. */
const wordsIn = (moment: Moment): string[] =>
  drawingIn(moment).commands.flatMap(command =>
    command.op === 'text' ? [command.text] : [],
  );

describe('the coin demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('coin');
  }, 60000);

  it('spins — a different cell of its sheet, frame to frame', () => {
    // The whole of the claim, and one a still cannot make: "Coin Spin" is in
    // the row's list of what the import also brings, and a frozen cell of an
    // animation looks exactly like a coin that does not move.
    const cells = new Set(
      moments.flatMap(moment =>
        moment.drawn.flatMap(cell => ('source' in cell ? [cell.source.x] : [])),
      ),
    );
    expect(cells.size).toBeGreaterThan(3);
  });
});

describe('the ground demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('ground');
  }, 60000);

  /** Where each actor was, by id, over the whole recording. */
  const traveled = (moments: Moment[]) => {
    const paths = new Map<string, {x: number; y: number}[]>();
    for (const moment of moments) {
      for (const cell of moment.drawn) {
        paths.set(cell.id, [
          ...(paths.get(cell.id) ?? []),
          {x: cell.x, y: cell.y},
        ]);
      }
    }
    return paths;
  };

  it('catches what falls, and holds it up', () => {
    const paths = traveled(moments);
    const moving = [...paths].filter(([, path]) =>
      path.some(one => one.y !== path[0].y),
    );
    // One thing moves and everything else is floor: a tile that wandered would
    // be a demo of something other than a floor.
    expect(moving.length).toBe(1);

    const [, path] = moving[0];
    const rested = path[path.length - 1].y;
    // It fell, it stopped, and it stopped ABOVE the tiles rather than in them.
    expect(rested).toBeGreaterThan(path[0].y + 20);
    expect(path[path.length - 2].y).toBeCloseTo(rested, 5);
    const floor = paths.get([...paths.keys()][0])![0].y;
    expect(rested).toBeLessThan(floor);
  });
});

describe('the progress bar demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('progressBar');
  }, 60000);

  /** How wide the bar's fill is drawn — the second rectangle, over the track. */
  const filled = (moment: Moment) => {
    const [, fill] = drawingIn(moment).commands;
    if (fill.op !== 'rectangle') {
      throw new Error('the bar drew something other than a rectangle');
    }
    return fill.width;
  };

  it('fills, and the fill is the fraction', () => {
    // What the actor IS: the arithmetic between a number and a width. A bar
    // that stopped reading `fraction` would draw the same rectangle forever
    // and look perfectly reasonable doing it.
    //
    // Frame one is a quarter, not nothing: it is the still every unselected
    // row shows, and an empty track is the one picture of this actor that
    // does not look like a bar.
    const whole = drawingIn(moments[0]).width;
    expect(filled(moments[0])).toBeCloseTo(whole / 4, 5);
    expect(filled(moments[moments.length - 1])).toBe(whole);
    const widths = moments.map(filled);
    expect(
      widths.every((width, at) => at === 0 || width >= widths[at - 1]),
    ).toBe(true);
  });
});

describe('the label demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('label');
  }, 60000);

  it('says what it is told to, and says something else later', () => {
    const said = new Set(moments.flatMap(wordsIn));
    expect(said.size).toBeGreaterThan(3);
    expect([...said][0]).toContain('SCORE');
  });

  it('says nothing the recorder cannot draw', () => {
    // A character with no glyph draws as a gap, and nothing downstream can
    // tell that gap from a space — so the demo's own words are checked here,
    // as the rule demos' are.
    for (const line of new Set(moments.flatMap(wordsIn))) {
      for (const character of line.toUpperCase()) {
        expect(KNOWN.has(character), `${line}: ${character}`).toBe(true);
      }
    }
  });
});

describe('the portrait demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('portrait');
  }, 60000);

  /** How solid the face is drawn — a box has no opacity, and none is drawn. */
  const opacity = (moment: Moment) => {
    const [cell] = moment.drawn;
    return 'opacity' in cell ? (cell.opacity ?? 1) : 1;
  };

  it('goes, and comes back', () => {
    // The thing its stillness hides. A Portrait's opacity is the whole of what
    // its file does besides wear a face, and a broken `set opacity` looks
    // exactly like a portrait: still there, all the way through.
    expect(Math.min(...moments.map(opacity))).toBeLessThan(0.1);
    expect(Math.max(...moments.map(opacity))).toBe(1);
  });

  it('is on screen in the frame the shelf shows', () => {
    // Frame one is the still every unselected row shows (specs/RULE_DEMOS.md),
    // so a scene that began at the start of the fade would put an empty black
    // rectangle on the shelf.
    expect(opacity(moments[0])).toBe(1);
  });
});

describe('the speech box demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('speechBox');
  }, 60000);

  it('types one line out, and then the next', () => {
    // A panel that keeps its words is a picture of a panel. What makes this a
    // Speech Box is that the sentence arrives, and is then replaced while the
    // box is not.
    //
    // EVERY MOMENT IS A PREFIX of the line being said, which is the typewriter
    // itself: the box lets the line out a letter at a time, so the strip is
    // partial sentences and only the last frame of a beat is whole. A box that
    // set its text instead would draw each line whole from its first frame,
    // and every moment would be one of two.
    const said = moments.map(moment => wordsIn(moment).join(''));
    const lines = ['IT IS DARK IN HERE.', 'SOMETHING MOVES.'];
    for (const words of said) {
      expect(
        lines.some(line => line.startsWith(words)),
        words,
      ).toBe(true);
    }
    // Both lines were reached, and each was typed rather than appearing whole.
    for (const line of lines) {
      expect(said).toContain(line);
      expect(
        said.filter(words => line.startsWith(words)).length,
      ).toBeGreaterThan(1);
      for (const character of line) {
        expect(KNOWN.has(character), `${line}: ${character}`).toBe(true);
      }
    }
  });
});

describe('the button demo', () => {
  let moments: Moment[];
  beforeAll(async () => {
    moments = await play('button');
  }, 60000);

  /** Where the cursor is drawn, which is where the pointer was set. */
  const cursorIn = (moment: Moment) =>
    moment.drawn.find(cell => cell.id === 'pointer')!;

  it('shows the pointer arriving, and pressing', () => {
    // The cause, in the frame. A strip of a button answering nobody is a strip
    // of a button that changed its mind.
    const sizes = new Set(moments.map(moment => cursorIn(moment).width));
    expect(sizes.size).toBe(2);
    const traveled = new Set(
      moments.map(moment => `${cursorIn(moment).x},${cursorIn(moment).y}`),
    );
    expect(traveled.size).toBeGreaterThan(5);
  });

  it('answers the press, and not before it', () => {
    // The whole demonstration, and the one thing that cannot be faked into
    // looking right: the pointer is set in VIEWPORT pixels and the actor is
    // hit-tested in world ones, so a conversion that is wrong by the width of
    // a camera means no event, no answer, and a strip of a cursor passing over
    // a button that ignores it.
    const words = moments.map(moment => {
      const cell = moment.drawn.find(one => 'commands' in one)!;
      if (!('commands' in cell)) {
        throw new Error('the button drew no drawing');
      }
      return cell.commands.flatMap(command =>
        command.op === 'text' ? [command.text] : [],
      );
    });
    expect(words[0]).toEqual(['PRESS ME']);
    expect(words[words.length - 1]).toEqual(['THANKS!']);
    // …and it changed once, when it was pressed, rather than on some frame of
    // its own choosing.
    const changed = words.findIndex(said => said[0] === 'THANKS!');
    expect(moments[changed].seconds).toBeGreaterThanOrEqual(1.2);
    expect(moments[changed].seconds).toBeLessThan(1.5);
  });
});
