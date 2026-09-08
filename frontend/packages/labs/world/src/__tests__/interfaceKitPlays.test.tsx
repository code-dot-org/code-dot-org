// The interface kit, PLAYED: typed into, clicked, and answered.
//
// Every actor in the set is on this screen, and what is being checked is that
// they COMPOSE — a field takes the typing, a bar follows the field's own
// event, a button raises a click with no hit test anywhere, and a Speech Box
// says what the button asked it to, a letter at a time (specs/UI_ACTORS.md).
//
// Each of those is a seam between two files that were written apart, and the
// only place they are all in one world.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const at = (world: {actors: Iterable<unknown>}, type: string) =>
  [...world.actors].find(one => (one as {type?: string}).type === type) as {
    get(p: unknown): unknown;
    act(a: unknown, ...rest: unknown[]): void;
  };

describe('the interface kit', () => {
  const open = async () => {
    const {world, modules} = await compileProject(
      projectFiles(WORLD_SCENARIOS.interface.source),
    );
    const text = modules['actors/label'].TextProperty;
    const fraction = modules['actors/progressBar'].FractionProperty;
    return {
      world,
      says: (type: string) => at(world, type).get(text) as string,
      filled: () => at(world, 'actors/progressBar').get(fraction) as number,
      click: (x: number, y: number) => {
        world.setPointer({x, y}, ['left']);
        world.tick(1 / 60);
        world.setPointer({x, y}, []);
        world.tick(1 / 60);
      },
      type: (characters: string[]) => {
        world.addTyped(characters);
        world.tick(1 / 60);
      },
    };
  };

  it('places one of each, saying what it ships with', async () => {
    const kit = await open();

    expect(kit.says('actors/label')).toBe('WHAT IS YOUR NAME?');
    expect(kit.says('actors/button')).toBe('SAY HELLO');
    // The field ships EMPTY, where a Label ships with words: a field whose
    // first keystroke has to delete something is a field with a bug in it.
    expect(kit.says('actors/textInput')).toBe('');
  });

  it('takes the typing once the field is clicked, and moves the bar', async () => {
    // Two seams at once. The field takes what was TYPED, and the BAR follows —
    // which it can only do because the field raises `changed`, an event the
    // actor declares for itself and the world hears (`ActorBuilder.defineEvent`).
    const kit = await open();
    expect(kit.filled()).toBe(0);

    kit.click(160, 80);
    kit.type(['A', 'd', 'a']);

    expect(kit.says('actors/textInput')).toBe('Ada');
    // A FRAME LATER for the bar, and the reason is the event queue: `changed`
    // is raised from inside a handler, and an event raised while this tick's
    // events are being dispatched is delivered on the next one. That is what
    // keeps a handler from growing the list it is being walked from, and it
    // costs one frame — a sixtieth of a second, on a bar nobody is racing.
    expect(kit.filled()).toBe(0);
    kit.world.tick(1 / 60);
    expect(kit.filled()).toBeCloseTo(3 / 12, 5);
  });

  it('answers the button, a letter at a time', async () => {
    // The click needs no hit test written anywhere — `is clicked with` is
    // raised on the Button alone — and the Speech Box lets the line out on its
    // own timer rather than showing it whole.
    const kit = await open();
    kit.click(160, 80);
    kit.type(['A', 'd', 'a']);
    kit.click(160, 130);

    // Part way through after a quarter of a second: the whole line at once
    // would mean the typewriter never ran.
    for (let frame = 0; frame < 15; frame++) {
      kit.world.tick(1 / 60);
    }
    const part = kit.says('actors/speechBox');
    expect(part.length).toBeGreaterThan(0);
    expect('HELLO Ada'.startsWith(part)).toBe(true);
    expect(part).not.toBe('HELLO Ada');

    for (let frame = 0; frame < 120; frame++) {
      kit.world.tick(1 / 60);
    }
    expect(kit.says('actors/speechBox')).toBe('HELLO Ada');
  });

  it('does not take typing meant for nobody', async () => {
    // Clicking the button rather than the field leaves the field alone, which
    // is the clear-then-set the Mouse rule's ordering buys (`rules/mouse`).
    const kit = await open();
    kit.click(160, 130);
    kit.type(['x']);

    expect(kit.says('actors/textInput')).toBe('');
  });
});
