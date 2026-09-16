// One actor carried by another (specs/PARENTING.md).
//
// The claim under test is the one that makes parenting safe for everything
// already written: `position` keeps meaning the world position. A child
// stores its transform in its parent's frame and answers in the world's, on
// every read, so a rule that never heard of parents reads the right number.

import {afterEach, describe, expect, it, vi} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {Actor} from '../core/Actor';
import {DEFAULT_LAYER_ID} from '../core/Layer';
import {compose, toLocal, type Transform} from '../core/parenting';
import {Vector} from '../core/Vector';
import type {World} from '../core/World';
import {
  CreatedEvent,
  GainedChildEvent,
  GotParentEvent,
  LostChildEvent,
  LostParentEvent,
  ParentProperty,
  PositionalTrait,
  PositionProperty,
  RemovedEvent,
  RotationProperty,
  ScaleProperty,
} from '../rules/spatial';

const template = (id: string) =>
  new ActorBuilder({id, name: id}).useTraits([PositionalTrait]);

const world = () => new WorldBuilder({id: 'w', name: 'W'}).instantiate();

const place = (into: World, id: string, x = 0, y = 0, layer?: string): Actor =>
  into.addActor(
    template(id).set(PositionProperty, new Vector(x, y)).instantiate(id),
    layer,
  );

const at = (actor: Actor) => {
  const position = actor.get(PositionProperty);
  return [position.x, position.y];
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the arithmetic', () => {
  const parent: Transform = {
    position: new Vector(100, 100),
    rotation: 90,
    scale: new Vector(2, 2),
  };
  const local: Transform = {
    position: new Vector(0, -24),
    rotation: 10,
    scale: new Vector(1, 0.5),
  };

  it('composes translate, rotate, scale, parent first', () => {
    // Up the parent is (0, −24) local; the parent faces down (90°) and is
    // twice its size, so the child stands 48 off the parent's right side.
    const composed = compose(parent, local);
    expect(composed.position.x).toBeCloseTo(148);
    expect(composed.position.y).toBeCloseTo(100);
    expect(composed.rotation).toBe(100);
    expect(composed.scale).toEqual(new Vector(2, 1));
  });

  it('undoes itself', () => {
    const back = toLocal(parent, compose(parent, local));
    expect(back.position.x).toBeCloseTo(local.position.x);
    expect(back.position.y).toBeCloseTo(local.position.y);
    expect(back.rotation).toBeCloseTo(local.rotation);
    expect(back.scale.x).toBeCloseTo(local.scale.x);
    expect(back.scale.y).toBeCloseTo(local.scale.y);
  });

  it('answers zero under a parent scaled to nothing, rather than infinity', () => {
    const flat = {...parent, scale: new Vector(0, 2)};
    expect(toLocal(flat, compose(flat, local)).position.x).toBe(0);
  });
});

describe('a root', () => {
  it('reads and writes its transform exactly as before', () => {
    const w = world();
    const actor = place(w, 'a', 10, 20);
    expect(at(actor)).toEqual([10, 20]);
    actor.set(PositionProperty, new Vector(30, 40));
    expect(at(actor)).toEqual([30, 40]);
    expect(actor.local(PositionProperty)).toEqual(new Vector(30, 40));
    expect(actor.parent()).toBeUndefined();
    expect(actor.children()).toEqual([]);
  });
});

describe('a child', () => {
  it('is where its parent is, plus its local place', () => {
    const w = world();
    const panel = place(w, 'panel', 100, 100);
    const button = place(w, 'button', 0, 0);
    button.setParent(panel, {keepWorld: false});
    button.setLocal(PositionProperty, new Vector(60, 30));
    expect(at(button)).toEqual([160, 130]);
    panel.set(PositionProperty, new Vector(200, 100));
    expect(at(button)).toEqual([260, 130]);
  });

  it('turns and grows with its parent', () => {
    const w = world();
    const tank = place(w, 'tank', 100, 100);
    const turret = place(w, 'turret', 0, 0);
    turret.setParent(tank, {keepWorld: false});
    turret.setLocal(PositionProperty, new Vector(0, -24));
    tank.set(RotationProperty, 90);
    tank.set(ScaleProperty, new Vector(2, 2));
    const [x, y] = at(turret);
    expect(x).toBeCloseTo(148);
    expect(y).toBeCloseTo(100);
    expect(turret.get(RotationProperty)).toBe(90);
    expect(turret.get(ScaleProperty)).toEqual(new Vector(2, 2));
  });

  it('composes through a chain of three', () => {
    const w = world();
    const a = place(w, 'a', 10, 10);
    const b = place(w, 'b');
    const c = place(w, 'c');
    b.setParent(a, {keepWorld: false});
    b.setLocal(PositionProperty, new Vector(5, 0));
    c.setParent(b, {keepWorld: false});
    c.setLocal(PositionProperty, new Vector(0, 5));
    expect(at(c)).toEqual([15, 15]);
    a.set(PositionProperty, new Vector(20, 20));
    expect(at(c)).toEqual([25, 25]);
  });

  it('stores a written world position in its parent’s frame, and stays put', () => {
    const w = world();
    const panel = place(w, 'panel', 100, 100);
    const button = place(w, 'button');
    button.setParent(panel);
    button.set(PositionProperty, new Vector(160, 130));
    expect(button.local(PositionProperty)).toEqual(new Vector(60, 30));
    expect(at(button)).toEqual([160, 130]);
    panel.set(PositionProperty, new Vector(0, 0));
    expect(at(button)).toEqual([60, 30]);
  });

  it('is written through the property too, the way a block writes it', () => {
    const w = world();
    const panel = place(w, 'panel', 100, 100);
    const button = place(w, 'button', 160, 130);
    button.set(ParentProperty, [panel]);
    expect(button.parent()).toBe(panel);
    expect(button.local(PositionProperty)).toEqual(new Vector(60, 30));
    button.set(ParentProperty, []);
    expect(button.parent()).toBeUndefined();
    expect(at(button)).toEqual([160, 130]);
  });
});

describe('set parent', () => {
  it('keeps the world position, so nothing jumps', () => {
    const w = world();
    const panel = place(w, 'panel', 100, 100);
    panel.set(RotationProperty, 90);
    const button = place(w, 'button', 160, 130);
    expect(button.setParent(panel)).toBe(true);
    const [x, y] = at(button);
    expect(x).toBeCloseTo(160);
    expect(y).toBeCloseTo(130);
    // …and back out, still where it was.
    expect(button.setParent(undefined)).toBe(true);
    expect(at(button).map(Math.round)).toEqual([160, 130]);
    expect(button.local(PositionProperty).x).toBeCloseTo(160);
  });

  it('refuses a cycle, with a warning, and changes nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const w = world();
    const a = place(w, 'a');
    const b = place(w, 'b');
    const c = place(w, 'c');
    b.setParent(a);
    c.setParent(b);
    expect(a.setParent(c)).toBe(false);
    expect(a.setParent(a)).toBe(false);
    expect(a.parent()).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('gives the child its parent’s layer', () => {
    const w = new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: DEFAULT_LAYER_ID})
      .defineLayer({id: 'hud', fit: true})
      .instantiate();
    const panel = place(w, 'panel', 0, 0, 'hud');
    const button = place(w, 'button');
    expect(button.layer).toBe(DEFAULT_LAYER_ID);
    button.setParent(panel);
    expect(button.layer).toBe('hud');
  });

  it('lists the children in placement order', () => {
    const w = world();
    const panel = place(w, 'panel');
    const one = place(w, 'one');
    const two = place(w, 'two');
    two.setParent(panel);
    one.setParent(panel);
    expect(panel.children().map(child => child.id)).toEqual(['one', 'two']);
    expect(w.childrenOf(panel)).toHaveLength(2);
  });
});

describe('the events', () => {
  /** Every parenting event heard, as `who event value`. */
  const listening = () => {
    const heard: string[] = [];
    const listen = (id: string) =>
      template(id)
        .on(GotParentEvent, (_w, actor, detail) => {
          heard.push(`${actor.id} gets ${(detail as Actor).id}`);
        })
        .on(LostParentEvent, (_w, actor, detail) => {
          heard.push(`${actor.id} loses ${(detail as Actor).id}`);
        })
        .on(GainedChildEvent, (_w, actor, detail) => {
          heard.push(`${actor.id} gains ${(detail as Actor).id}`);
        })
        .on(LostChildEvent, (_w, actor, detail) => {
          heard.push(`${actor.id} drops ${(detail as Actor).id}`);
        })
        .on(RemovedEvent, (_w, actor) => {
          heard.push(`${actor.id} removed`);
        });
    return {heard, listen};
  };

  it('raises four, in order, with the other actor as the value', () => {
    const {heard, listen} = listening();
    const w = world();
    const old = w.addActor(listen('old').instantiate('old'));
    const next = w.addActor(listen('next').instantiate('next'));
    const child = w.addActor(listen('child').instantiate('child'));
    child.setParent(old);
    w.tick(1 / 60);
    heard.length = 0;
    child.setParent(next);
    expect(heard).toEqual([]); // queued, as every event is
    w.tick(1 / 60);
    expect(heard).toEqual([
      'old drops child',
      'child loses old',
      'child gets next',
      'next gains child',
    ]);
  });

  it('raises none for the parent it already has', () => {
    const {heard, listen} = listening();
    const w = world();
    const panel = w.addActor(listen('panel').instantiate('panel'));
    const child = w.addActor(listen('child').instantiate('child'));
    child.setParent(panel);
    w.tick(1 / 60);
    heard.length = 0;
    child.setParent(panel);
    w.tick(1 / 60);
    expect(heard).toEqual([]);
  });

  it('removes the children with the parent, and nobody hears a loss', () => {
    const {heard, listen} = listening();
    const w = world();
    const panel = w.addActor(listen('panel').instantiate('panel'));
    const child = w.addActor(listen('child').instantiate('child'));
    const grandchild = w.addActor(listen('grand').instantiate('grand'));
    child.setParent(panel);
    grandchild.setParent(child);
    w.tick(1 / 60);
    heard.length = 0;
    w.removeActor(panel);
    expect([...w.actors]).toHaveLength(0);
    w.tick(1 / 60);
    expect(heard.sort()).toEqual(
      ['child removed', 'grand removed', 'panel removed'].sort(),
    );
  });

  it('cascades a removal asked for by a handler as well', () => {
    const w = world();
    const panel = w.addActor(
      template('panel')
        .on(CreatedEvent, (running, actor) => {
          running.removeActor(actor);
        })
        .instantiate('panel'),
    );
    const child = place(w, 'child');
    child.setParent(panel);
    w.tick(1 / 60);
    w.tick(1 / 60);
    expect([...w.actors]).toHaveLength(0);
  });
});

describe('a map', () => {
  it('loads a child at its parent plus its stored local place', () => {
    const {heard, listen} = (() => {
      const heard: string[] = [];
      const listen = (id: string) =>
        template(id)
          .on(CreatedEvent, (_w, actor) => {
            heard.push(`${actor.id} created`);
          })
          .on(GainedChildEvent, (_w, actor, detail) => {
            heard.push(`${actor.id} gains ${(detail as Actor).id}`);
          });
      return {heard, listen};
    })();
    const w = world();
    w.define('actors/panel', listen('panel'));
    w.define('actors/button', listen('button'));
    w.loadMap({
      actors: [
        {
          type: 'actors/panel',
          id: 'Dialog',
          properties: {positional: {position: {x: 100, y: 100}}},
        },
        {
          type: 'actors/button',
          id: 'OK',
          properties: {
            positional: {parent: 'Dialog', position: {x: 60, y: 30}},
          },
        },
      ],
    });
    const button = [...w.actors].find(actor => actor.id === 'OK')!;
    expect(button.parent()?.id).toBe('Dialog');
    expect(button.local(PositionProperty)).toEqual(new Vector(60, 30));
    expect(at(button)).toEqual([160, 130]);
    w.tick(1 / 60);
    // Every entry is created before any parent is known.
    expect(heard).toEqual(['Dialog created', 'OK created', 'Dialog gains OK']);
  });
});

describe('the render snapshot', () => {
  it('publishes the world transform, and the parent and local for a child', () => {
    const w = world();
    const panel = place(w, 'panel', 100, 100);
    const button = place(w, 'button');
    button.setParent(panel, {keepWorld: false});
    button.setLocal(PositionProperty, new Vector(60, 30));
    const states = w.renderSnapshot();
    const root = states.find(state => state.actor === panel)!;
    const child = states.find(state => state.actor === button)!;
    expect(root.parent).toBeUndefined();
    expect(root.local).toBeUndefined();
    expect([child.x, child.y]).toEqual([160, 130]);
    expect(child.parent).toBe(panel);
    expect(child.local).toEqual({
      x: 60,
      y: 30,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    });
  });
});
