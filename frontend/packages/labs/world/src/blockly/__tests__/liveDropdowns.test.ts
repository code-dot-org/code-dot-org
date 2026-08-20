// A live dropdown has to name a field its block actually has.
//
// `liveDropdown(name, FIELD, options)` swaps one field's option generator for
// one that reads the project registry AND knows which field it is on. Both
// halves matter: the second is how an option list can depend on where the block
// sits — the actors a WORLD defines for itself are found by asking the field
// for its workspace (blockly/localActors), and `use rule` leaves out the rule
// whose own file it is in (blockly/editingRule).
//
// Name a field the block does not have and the extension returns quietly. The
// block keeps the static generator from its own definition, which Blockly calls
// with NO arguments — so the registry half still works and the where-am-I half
// is gone. That is what `world_is_a` shipped as: it named its kind field TYPE
// (the socket beside it had taken ACTOR) while using the ACTOR-bound extension,
// so it listed the project's `.actor` files and never a world's own
// `define actor`. Nothing threw, and the menu just looked short.
//
// So this asks every block in the palette, rather than waiting for someone to
// open the menu on one.

import {describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {buildDomainPalette} from '../domainBlocks';
import {bindLiveOptions, liveDropdownFieldNames} from '../moduleOptions';
import {projectRuleMetas} from '../projectModules';

/** As much of a block definition as this needs to read. */
interface Definition {
  type: string;
  extensions?: Array<{name?: string} | string>;
  [key: string]: unknown;
}

/** Every field name a definition declares, across all of its `argsN` rows. */
function fieldNames(definition: Definition): Set<string> {
  const names = new Set<string>();
  for (const [key, value] of Object.entries(definition)) {
    if (!/^args\d+$/.test(key) || !Array.isArray(value)) {
      continue;
    }
    for (const argument of value as Array<{type?: unknown; name?: string}>) {
      // Anything named that is not a socket. A typed variable's field arrives
      // as an object rather than a `field_…` string (createTypedVariable), so
      // the test is what it is NOT.
      const socket =
        typeof argument?.type === 'string' &&
        argument.type.startsWith('input_');
      if (argument?.name && !socket) {
        names.add(argument.name);
      }
    }
  }
  return names;
}

const extensionName = (extension: {name?: string} | string): string =>
  typeof extension === 'string' ? extension : (extension.name ?? '');

// The generator's palette: every rule's blocks at once, which is every block
// this project can put in front of anyone.
const blocks = buildDomainPalette(
  projectRuleMetas(projectFiles(DEFAULT_PROJECT.source)),
  {allRuleModules: true},
).blocks as unknown as Definition[];

describe('live dropdowns', () => {
  it('are bound to fields their blocks have', () => {
    const fields = liveDropdownFieldNames();
    const misbound: string[] = [];

    for (const definition of blocks) {
      const declared = fieldNames(definition);
      for (const extension of definition.extensions ?? []) {
        const wants = fields.get(extensionName(extension));
        if (wants && !declared.has(wants)) {
          misbound.push(
            `${definition.type}: ${extensionName(extension)} wants a ` +
              `${wants} field, and it has ${[...declared].join(', ') || 'none'}`,
          );
        }
      }
    }

    expect(misbound).toEqual([]);
  });

  it('checks blocks that really use them', () => {
    // A guard on the guard. If the palette stopped reaching this test, or the
    // extensions stopped registering their field names, the check above would
    // pass by looking at nothing.
    const named = liveDropdownFieldNames();
    const users = blocks.filter(definition =>
      (definition.extensions ?? []).some(extension =>
        named.has(extensionName(extension)),
      ),
    );

    expect(named.size).toBeGreaterThanOrEqual(5);
    expect(users.length).toBeGreaterThanOrEqual(5);
    expect(users.map(definition => definition.type)).toContain('world_is_a');
  });
});

describe('a live dropdown has no cache', () => {
  it('regenerates even when asked for the cached list', () => {
    // Blockly caches a dynamic dropdown's options and resolves both the
    // validator and the label against that cache. `bindLiveOptions` replaces
    // `getOptions` with a call to the registry — it takes no `useCache`
    // argument at all — so there is nothing left to invalidate.
    //
    // This is here because two import extensions rebuild the option list
    // before writing an imported value, with a comment saying that without it
    // the field would take the value and go on showing "(none)" — and three
    // sibling extensions do not, which reads like a bug in three places. It is
    // not: the rebuild is belt and braces on a live-bound field, and every
    // field with an `(import…)` row is live-bound. This is what says so, so the
    // next person to notice the difference does not have to work it out again.
    let live: Array<[string, string]> = [['old', 'old.mp3']];
    const field = new Blockly.FieldDropdown(() => live);
    bindLiveOptions(field as never, () => live);
    field.getOptions(true);

    live = [['new', 'new.mp3']];

    expect(field.getOptions(true)).toEqual([['new', 'new.mp3']]);
  });
});
