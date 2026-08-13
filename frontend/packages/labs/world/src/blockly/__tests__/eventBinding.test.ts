// What an event's hat does with the value the event carries.
//
// It FILTERS, always — it never binds. A parameter drawn from a set of choices
// waits for one of them; an ACTOR parameter waits for a KIND, which is a set of
// choices too, just the project's own rather than a fixed one. Either way the
// hat generates a guard that leaves when this is not the event you meant.
//
// The value itself is reached with `event actor`, a block. An earlier version
// bound it to a variable field on the hat, which listed every other Actor
// variable in the file as though picking one were a choice — when the hat has
// exactly one thing to hand over and there is nothing to choose.

import {describe, expect, it} from 'vitest';

import {collisionsRule} from '../../rules/stock/collisions';
import {inputRule} from '../../rules/stock/input';
import {buildDomainPalette} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';

// The palette and the registry go together and always did: the editor
// registers the project's rules and builds the palette from the same list, in
// the same breath. It has to be said now, because a member block whose rule the
// registry cannot find generates NOTHING — that is how a deleted rule stops
// taking the whole project down with it (domainBlocks, `refResolves`).
const paletteFor = (path: string, source: string) => {
  const meta = parseRuleMeta(path, source)!;
  registerProjectRules([meta]);
  return buildDomainPalette([meta], {allRuleModules: true});
};

const blockNamed = (path: string, source: string, type: string) =>
  paletteFor(path, source).blocks.find(
    block => block.type === type,
  ) as never as
    | {message0: string; args0?: Array<{type: string; name: string}>}
    | undefined;

const CONTACT_HAT = 'world_on_Collisions_StartsTouchingEvent';
const KEY_HAT = 'world_on_Input_IsPressedEvent';

describe('an event that carries an actor', () => {
  it('filters by kind, with `(any)` first', () => {
    // "Starts touching a brick" is what a game means almost every time, and it
    // saves the handler opening with `if ⟨…⟩ is a ⟨Brick⟩`. `(any)` first, so
    // a hat dragged out hears everything until someone narrows it.
    const hat = blockNamed('rules/collisions', collisionsRule, CONTACT_HAT);
    const filter = hat?.args0?.find(arg => arg.name === 'FILTER0') as
      | {type: string; options?: Array<[string, string]>}
      | undefined;

    expect(filter?.type).toBe('field_dropdown');
    expect(filter?.options?.[0]?.[1]).toBe('');
  });

  it('says so in the wording', () => {
    expect(
      blockNamed('rules/collisions', collisionsRule, CONTACT_HAT)?.message0,
    ).toMatch(/when %1 starts touching %2/);
  });

  it('binds nothing — no variable, no renamed argument', () => {
    // The handler still receives `eventValue`; `event actor` is what reads it.
    const emitted = generate(CONTACT_HAT);

    expect(emitted).toContain('(world, actor, eventValue) =>');
    expect(emitted).not.toContain('= eventValue;');
  });

  it('guards on the kind by the same test `is a` makes', () => {
    // One notion of what an actor's kind IS, compared the same way in both
    // places — `.type` against the module path the world stamps.
    const emitted = generate(CONTACT_HAT, {FILTER0: 'actors/coin'});

    expect(emitted).toContain(
      'if (eventValue?.type !== "actors/coin") return;',
    );
  });

  it('guards on nothing when the kind is `(any)`', () => {
    expect(generate(CONTACT_HAT, {FILTER0: ''})).not.toContain('type !==');
  });
});

describe('an event that carries a choice', () => {
  it('still filters, and binds nothing', () => {
    // The treatment that already existed, unchanged. A key event's hat offers
    // the keys with `(any)`, and generates the guard rather than a name.
    const hat = blockNamed('rules/input', inputRule, KEY_HAT);

    expect(hat?.args0?.some(arg => arg.name === 'BOUND')).toBeFalsy();
    expect(hat?.args0?.some(arg => arg.type === 'field_dropdown')).toBe(true);
  });
});

/** Generate a hat's code with a stand-in block, as the other block tests do. */
function generate(type: string, fields: Record<string, string> = {}): string {
  const palette = paletteFor('rules/collisions', collisionsRule);
  const block = palette.blocks.find(each => each.type === type)!;
  return String(
    block.generator.javascript(
      {
        getFieldValue: (name: string) => fields[name],
        getNextBlock: () => null,
        getInputTargetBlock: () => null,
        getSurroundParent: () => null,
      } as never,
      {
        getVariableName: () => 'other',
        blockToCode: () => '',
        valueToCode: () => '',
        // `refCode` registers the event's import here; the real generator
        // hoists these in `finish`.
        definitions_: {},
      } as never,
      {} as never,
    ),
  );
}
