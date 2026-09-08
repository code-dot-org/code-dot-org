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
//
// AND ONE CLAIM IS ABOUT NOT ACTING. The browser has a Tab key too, and it is
// how a keyboard user gets past the canvas — so while nothing in the world
// holds the focus, a Tab press must do NOTHING here. A rule that always moved
// the focus on would pass every test above and make the game a place a
// keyboard can enter and not leave (specs/UI_ACTORS.md).

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
 * The player arrives at the game — tabs onto the canvas, or clicks it.
 *
 * NOT A TAB PRESS, and that is the distinction the rule is built around: the
 * Tab that carried them here was pressed while the page still had the
 * keyboard, so nothing in the pressed keys can tell arriving from moving on
 * (`World.gainedKeyboard`).
 */
const enter = (world: World) => {
  world.gainedKeyboard();
  world.tick(1 / 60);
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
  it('does nothing on Tab while nothing holds the focus', () => {
    // THE KEYBOARD TRAP, and the one claim here that is about not acting. That
    // Tab is the page's: it is how a player gets past the canvas, and a rule
    // that answered it would pull them straight back in the moment they
    // pressed Escape to leave.
    const {world, fields} = form();

    press(world, 'Tab');

    expect(holder(fields)).toBe(-1);
    expect([...world.capturedKeys()]).toEqual([]);
  });

  it('gives the focus to the first one when the player arrives', () => {
    // Arriving at the game is its own moment, reported by the driver when the
    // canvas takes the keyboard — from a Tab pressed out on the page, or a
    // click.
    const {world, fields} = form();

    enter(world);

    expect(holder(fields)).toBe(0);
  });

  it('takes Tab from the browser only while it is being used', () => {
    // The other half of the same bargain. While an actor holds the focus the
    // game wants Tab; the moment it does not, the key goes back — and Escape
    // is what does it, which is why Escape can never be captured
    // (`core/keys`, RESERVED_KEYS).
    const {world} = form();

    enter(world);
    expect([...world.capturedKeys()]).toEqual(['tab']);

    press(world, 'Escape');
    expect([...world.capturedKeys()]).toEqual([]);
  });

  it('moves it on, one at a time, and wraps', () => {
    const {world, fields} = form();
    enter(world);

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
    enter(world);

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

    enter(world);
    expect(holder(fields)).toBe(2);

    press(world, 'Tab');
    expect(holder(fields)).toBe(0);
  });

  it('drops the focus on Escape, so the keyboard goes back to the page', () => {
    // The way out, and the reason the game may claim Tab at all: with nothing
    // holding the focus, the next Tab is neither captured nor answered, so the
    // browser moves the player past the canvas.
    const {world, fields} = form();
    enter(world);

    press(world, 'Escape');
    expect(holder(fields)).toBe(-1);

    press(world, 'Tab');
    expect(holder(fields)).toBe(-1);
  });

  it('lets the player back in after they left', () => {
    // Escape then Tab takes them out; tabbing back on brings them to the front
    // of the route again rather than to wherever they had got to.
    const {world, fields} = form();
    enter(world);
    press(world, 'Tab');
    press(world, 'Escape');

    enter(world);

    expect(holder(fields)).toBe(0);
  });

  it('leaves the focus where it is when the player returns to it', () => {
    // Clicking away and back is not arriving: the canvas takes the keyboard
    // again, and the field that was being typed into is still the one.
    const {world, fields} = form();
    enter(world);
    press(world, 'Tab');

    enter(world);

    expect(holder(fields)).toBe(1);
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

    enter(world);
    press(world, 'Tab');

    expect(said).toEqual(['gain 0', 'lose 0', 'gain 1']);
  });

  it('says nothing when the focus does not actually move', () => {
    // One focusable actor, tabbed: the route wraps onto the actor that already
    // has it, and `take the focus` declines rather than raising a loss and a
    // gain for an actor that never let go.
    const {world, fields} = form(1);
    const said: string[] = [];
    fields[0].on(of('GainsFocusEvent'), () => said.push('gain'));
    fields[0].on(of('LosesFocusEvent'), () => said.push('lose'));

    enter(world);
    press(world, 'Tab');

    expect(said).toEqual(['gain']);
  });

  it('leaves the key alone when nothing in the world can hold it', () => {
    // A world with no interface in it is a world where Tab is the page's, and
    // a rule that threw here would break every project that imported it and
    // then built a platformer.
    const {world} = form(0);

    expect(() => enter(world)).not.toThrow();
    expect(() => press(world, 'Tab')).not.toThrow();
    expect([...world.capturedKeys()]).toEqual([]);
  });

  it('skips an actor that did not elect the trait', () => {
    const {world, fields} = form(1);
    const scenery = new ActorBuilder({id: 's', name: 's'}).instantiate('s');
    world.addActor(scenery);

    enter(world);
    press(world, 'Tab');

    expect(holder(fields)).toBe(0);
  });
});
