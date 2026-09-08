// Tab Navigation, RUN — where the focus goes when Tab is pressed.
//
// The rule interface actors were missing. A Text Input decided for itself
// whether it was being typed at, which works for exactly one field and falls
// apart at two: focus is a fact about the SCREEN, not about a field, and
// nothing a single actor can know is an actor's to decide.
//
// So the claims here are about the whole set at once: exactly one actor holds
// it, the route wraps, `tab order` overrides where they were placed, Escape
// gives the keyboard back, and the two events say what actually happened. Read
// rather than run, every one of those would have passed on a rule that
// declared the right members and moved the focus nowhere.

import {beforeAll, describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder, type Actor, type World} from '../../engine';
import {keyName} from '../../engine/core/keys';
import {tabNavigationRule} from '../stock';

import {compileStockRules, type RuleModule} from './support/compileStockRules';

const PATH = 'rules/tabNavigation';

let modules: Record<string, RuleModule>;

/** A member of the compiled rule — the trait, a property, an event. */
const of = (name: string) => modules[PATH][name] as never;

beforeAll(async () => {
  // Alone: it imports `world-lab` and nothing else. Reading the keyboard's
  // edges is the World's, so this needs neither the Input rule nor the Mouse.
  modules = await compileStockRules({[PATH]: tabNavigationRule});
}, 30000);

/** A world holding `count` focusable actors, added in order. */
const form = (count = 3) => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([modules[PATH].default as never])
    .instantiate();
  const fields: Actor[] = [];
  for (let index = 0; index < count; index += 1) {
    const field = new ActorBuilder({id: `f${index}`, name: `f${index}`})
      .useTraits([of('CanBeFocusedTrait')])
      .instantiate(`f${index}`);
    world.addActor(field);
    fields.push(field);
  }
  return {world, fields};
};

/**
 * Press a key and let the frame it landed in finish.
 *
 * Through `keyName`, as the driver does: the browser says `Tab` and the rule
 * compares against `tab`, and a test handing the engine its own name would
 * pass against a rule nobody could actually reach (`engine/core/keys`).
 *
 * Released on the second tick, because the step reads EDGES — a key left down
 * would move the focus once and then never again, which is right, and would
 * make the next press in a test do nothing at all.
 */
const press = (world: World, domKey: string) => {
  world.setInput([keyName(domKey)]);
  world.tick(1 / 60);
  world.setInput([]);
  world.tick(1 / 60);
};

/** Which of them holds the focus, by index — or -1. */
const holder = (fields: readonly Actor[]) =>
  fields.findIndex(field => field.get(of('FocusedProperty')) === true);

describe('Tab Navigation', () => {
  it('gives the focus to the first one when nothing has it', () => {
    // Arriving from outside the world is the same move as wrapping round the
    // end of it, which is why one branch does both.
    const {world, fields} = form();

    press(world, 'Tab');

    expect(holder(fields)).toBe(0);
  });

  it('moves it on, one at a time, and wraps', () => {
    const {world, fields} = form();

    press(world, 'Tab');
    press(world, 'Tab');
    expect(holder(fields)).toBe(1);

    press(world, 'Tab');
    expect(holder(fields)).toBe(2);

    // Round the end and back to the front.
    press(world, 'Tab');
    expect(holder(fields)).toBe(0);
  });

  it('leaves exactly one holding it, never two', () => {
    // The whole reason this is a rule. Two fields that each decided for
    // themselves would both take the next keystroke.
    const {world, fields} = form();

    press(world, 'Tab');
    press(world, 'Tab');

    expect(
      fields.filter(field => field.get(of('FocusedProperty')) === true),
    ).toHaveLength(1);
  });

  it('follows tab order rather than placement when one is given', () => {
    // `tab order` is zero for everybody and the sort is stable, so an untouched
    // form tabs the way it was laid out. Say otherwise on one field and it
    // moves, and the ones left alone keep their order relative to each other.
    const {world, fields} = form();
    fields[2].set(of('TabOrderProperty'), -1 as never);

    press(world, 'Tab');
    expect(holder(fields)).toBe(2);

    press(world, 'Tab');
    expect(holder(fields)).toBe(0);
  });

  it('drops the focus on Escape, so the keyboard goes back to the page', () => {
    // The way out, and the reason the game may claim Tab at all: while nothing
    // in the world holds the focus, Tab is the browser's again
    // (specs/UI_ACTORS.md).
    const {world, fields} = form();
    press(world, 'Tab');

    press(world, 'Escape');

    expect(holder(fields)).toBe(-1);
  });

  it('says who gained it and who lost it, in that order', () => {
    // Both events, raised in one place, so they cannot disagree with the
    // property that describes the same fact.
    const {world, fields} = form(2);
    const said: string[] = [];
    fields.forEach((field, index) => {
      field.on(of('GainsFocusEvent'), () => said.push(`gain ${index}`));
      field.on(of('LosesFocusEvent'), () => said.push(`lose ${index}`));
    });

    press(world, 'Tab');
    press(world, 'Tab');

    expect(said).toEqual(['gain 0', 'lose 0', 'gain 1']);
  });

  it('says nothing when the focus does not actually move', () => {
    // One focusable actor, tabbed twice: the route wraps onto the actor that
    // already has it, and `take the focus` declines rather than raising a loss
    // and a gain for an actor that never let go.
    const {world, fields} = form(1);
    const said: string[] = [];
    fields[0].on(of('GainsFocusEvent'), () => said.push('gain'));
    fields[0].on(of('LosesFocusEvent'), () => said.push('lose'));

    press(world, 'Tab');
    press(world, 'Tab');

    expect(said).toEqual(['gain']);
  });

  it('leaves the key alone when nothing in the world can hold it', () => {
    // A world with no interface in it is a world where Tab is the page's, and
    // a rule that threw here would break every project that imported it and
    // then built a platformer.
    const {world} = form(0);

    expect(() => press(world, 'Tab')).not.toThrow();
  });

  it('skips an actor that did not elect the trait', () => {
    const {world, fields} = form(1);
    const scenery = new ActorBuilder({id: 's', name: 's'}).instantiate('s');
    world.addActor(scenery);

    press(world, 'Tab');
    press(world, 'Tab');

    expect(holder(fields)).toBe(0);
  });
});
