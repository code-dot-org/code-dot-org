// A property moved from one value to another over time.
//
// The thing nine stock rules currently hand-roll one at a time. `cameraEase`
// carries the clearest statement of why the obvious form is wrong — moving a
// fraction of the way each frame eases twice as fast at 120fps as at 60 — and
// that reasoning belongs in one place rather than re-derived per rule.
//
// A TWEEN OUTLIVES THE HANDLER THAT STARTS IT, which is why it is runtime state
// and not a loop. Nothing in this engine suspends.

import {describe, expect, it, vi} from 'vitest';

import {
  advanceTween,
  isTweenable,
  tweenValue,
  type TweenRun,
  type TweenStep,
} from '../core/tween';
import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';
import {OpacityProperty, AppearanceTrait} from '../rules/animation';
import {TweenFinishedEvent} from '../rules/spatial';

const step = (over: Partial<TweenStep> = {}): TweenStep => ({
  property: OpacityProperty as TweenStep['property'],
  from: 1,
  to: 0,
  ...over,
});

const run = (over: Partial<TweenRun> = {}): TweenRun => ({
  id: 'fade out',
  steps: [step()],
  duration: 1,
  curve: 'linear',
  elapsed: 0,
  ...over,
});

const world = () => {
  const builder = new WorldBuilder({id: 'w', name: 'W'});
  const built = builder.getWorld();
  const actor = builder.addActor(
    new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([AppearanceTrait])
      .set(PositionProperty, new Vector(0, 0)),
  );
  return {world: built, actor};
};

describe('the value between two ends', () => {
  it('interpolates a number', () => {
    expect(tweenValue(0, 10, 0.25)).toBe(2.5);
  });

  it('interpolates a vector componentwise', () => {
    const at = tweenValue(new Vector(0, 10), new Vector(10, 0), 0.5) as Vector;

    expect([at.x, at.y]).toEqual([5, 5]);
  });

  it('knows what has a path between two values and what does not', () => {
    // A color or a sprite name has no midpoint worth guessing at.
    expect(isTweenable(1)).toBe(true);
    expect(isTweenable(new Vector(0, 0))).toBe(true);
    expect(isTweenable('sprite.png')).toBe(false);
    expect(isTweenable(true)).toBe(false);
  });
});

describe('advancing one', () => {
  it('writes the property as it goes, and says when it is done', () => {
    const {actor} = world();
    const held = run({duration: 2});

    expect(advanceTween(held, actor, 1)).toBe(false);
    expect(actor.get(OpacityProperty)).toBe(0.5);

    expect(advanceTween(held, actor, 1)).toBe(true);
    expect(actor.get(OpacityProperty)).toBe(0);
  });

  it('lands exactly on the end, however the frames fall', () => {
    // Overshoot is the ordinary case — a frame lands past the deadline — and
    // an opacity of -0.3 is a bug the driver would faithfully render.
    const {actor} = world();

    advanceTween(run({duration: 1}), actor, 1.7);

    expect(actor.get(OpacityProperty)).toBe(0);
  });

  it('finishes at once when it was given no time', () => {
    // Better than dividing by zero, and it is what somebody asking for a
    // zero-length tween wants.
    const {actor} = world();

    expect(advanceTween(run({duration: 0}), actor, 0.016)).toBe(true);
    expect(actor.get(OpacityProperty)).toBe(0);
  });

  it('is the same journey however the frames are cut', () => {
    // The property `cameraEase` is about: one long frame and sixty short ones
    // arrive at the same place, so a slow machine does not fade faster.
    const {actor: slow} = world();
    const {actor: fast} = world();

    advanceTween(run({duration: 1}), slow, 0.5);
    const stepped = run({duration: 1});
    for (let frame = 0; frame < 30; frame++) {
      advanceTween(stepped, fast, 1 / 60);
    }

    expect(fast.get(OpacityProperty)).toBeCloseTo(
      slow.get(OpacityProperty),
      10,
    );
  });
});

describe('the curves', () => {
  it('all start at the start and end at the end', () => {
    for (const curve of [
      'linear',
      'ease-in',
      'ease-out',
      'ease-in-out',
    ] as const) {
      const {actor} = world();
      const held = run({curve, duration: 1});

      advanceTween(held, actor, 0);
      expect(actor.get(OpacityProperty)).toBe(1);

      advanceTween(held, actor, 1);
      expect(actor.get(OpacityProperty)).toBe(0);
    }
  });

  it('differ in the middle, which is the whole point of having them', () => {
    const at = (curve: TweenRun['curve']) => {
      const {actor} = world();
      advanceTween(
        run({curve, steps: [step({from: 0, to: 1})], duration: 1}),
        actor,
        0.25,
      );
      return actor.get(OpacityProperty);
    };

    expect(at('ease-in')).toBeLessThan(at('linear'));
    expect(at('ease-out')).toBeGreaterThan(at('linear'));
  });
});

describe('two tweens on one property', () => {
  it('keeps the newer and drops the older', () => {
    // LAST WRITE WINS, decided when it starts rather than per frame: two left
    // running would both write every tick and the winner would be whichever
    // the list reached second, which is a race and not a rule.
    const {actor} = world();
    const first = run({id: 'fade out'});

    actor.startTween(first);
    actor.startTween(run({id: 'fade in', steps: [step({from: 0, to: 1})]}));

    expect(actor.tweens().map(held => held.id)).toEqual(['fade in']);
  });

  it('says which one it displaced', () => {
    // Fading a thing out while fading it in is a real mistake, and honouring
    // one silently looks like the other never ran.
    const {actor} = world();
    const displaced = vi.fn();

    actor.startTween(run({id: 'fade out'}));
    actor.startTween(run({id: 'fade in'}), displaced);

    expect(displaced).toHaveBeenCalledWith(
      expect.objectContaining({id: 'fade out'}),
    );
  });

  it('leaves a tween on a DIFFERENT property alone', () => {
    const {actor} = world();

    actor.startTween(run({id: 'fade out'}));
    actor.startTween(
      run({
        id: 'slide',
        steps: [
          step({
            property: PositionProperty as TweenStep['property'],
            from: new Vector(0, 0),
            to: new Vector(10, 0),
          }),
        ],
      }),
    );

    expect(actor.tweens()).toHaveLength(2);
  });
});

describe('a tween running in a world', () => {
  it('advances every frame and raises an event when it lands', async () => {
    const {world: built, actor} = world();
    const finished: unknown[] = [];
    actor.on(TweenFinishedEvent, (_w, _a, value) => finished.push(value));

    actor.startTween(run({duration: 0.1}));
    built.tick(0.05);

    expect(actor.get(OpacityProperty)).toBeCloseTo(0.5, 6);
    expect(finished).toEqual([]);

    built.tick(0.05);

    // The name is carried, so one handler can answer for several tweens.
    expect(finished).toEqual(['fade out']);
    expect(actor.tweens()).toHaveLength(0);
  });

  it('survives a handler that starts another tween as it finishes', () => {
    // The list is copied before walking it, because this is the ordinary way
    // to chain two: fade out, then move, then fade in.
    const {world: built, actor} = world();
    actor.on(TweenFinishedEvent, () => {
      actor.startTween(
        run({id: 'fade in', steps: [step({from: 0, to: 1})], duration: 1}),
      );
    });

    actor.startTween(run({duration: 0.1}));

    expect(() => built.tick(0.2)).not.toThrow();
    expect(actor.tweens().map(held => held.id)).toEqual(['fade in']);
  });
});

// Several properties on one clock.
//
// Moving and fading together is the ordinary case — a character entering a
// scene does both — and a tween per property would raise a `finishes` for each,
// so a handler waiting for "the entrance is over" would fire twice and be right
// neither time.
describe('a tween of several properties', () => {
  const both = () =>
    run({
      id: 'enter',
      duration: 1,
      steps: [
        step({from: 0, to: 1}),
        step({
          property: PositionProperty as TweenStep['property'],
          from: new Vector(0, 0),
          to: new Vector(100, 0),
        }),
      ],
    });

  it('moves all of them together', () => {
    const {actor} = world();

    advanceTween(both(), actor, 0.5);

    expect(actor.get(OpacityProperty)).toBeCloseTo(0.5, 6);
    expect(actor.get(PositionProperty).x).toBeCloseTo(50, 6);
  });

  it('finishes once, when the whole thing lands', () => {
    const {actor} = world();
    const held = both();

    expect(advanceTween(held, actor, 0.5)).toBe(false);
    expect(advanceTween(held, actor, 0.5)).toBe(true);
  });

  it('is displaced whole by anything that touches one of its properties', () => {
    // Splitting the older run and keeping the half that does not clash is not
    // behavior anybody could predict. "Two tweens cannot fight over a
    // property, so the newer replaces the older" is one sentence.
    const {actor} = world();
    const displaced: string[] = [];

    actor.startTween(both());
    actor.startTween(run({id: 'fade in'}), gone => displaced.push(gone.id));

    expect(displaced).toEqual(['enter']);
    expect(actor.tweens().map(held => held.id)).toEqual(['fade in']);
  });

  it('leaves a run it shares nothing with alone', () => {
    const {actor} = world();

    actor.startTween(run({id: 'fade out'}));
    actor.startTween(
      run({
        id: 'slide',
        steps: [
          step({
            property: PositionProperty as TweenStep['property'],
            from: new Vector(0, 0),
            to: new Vector(10, 0),
          }),
        ],
      }),
    );

    expect(actor.tweens()).toHaveLength(2);
  });
});
