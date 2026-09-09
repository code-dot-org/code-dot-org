// An actor's OWN members must not be mistaken for a rule's.
//
// A member block names its member in its block TYPE, and nothing on the block
// can be asked which rule that member came from — so the factories say, once,
// as they define each block (`ruleRegistry.registerMemberBlockType`). What
// reads it is the warning on a dead reference: a block whose rule the project
// no longer has generates nothing, so it says so on its own face
// (`extensions/missingRule`).
//
// AN OWN MEMBER HAS NO RULE, and the trap is that it looks like it does. A
// `define event` in `textInput.actor` produces a ref carrying
// `ruleName: 'Text Input'` — the ACTOR's name, kept so the palette can label
// the drawer it goes in. Registered as a rule it is a rule the project will
// never have, so every own event in the project wore "your project does not
// have Text Input any more", for ever, while the project plainly had it.
//
// It is checked here against the fixture that holds every interface actor,
// because that is where it was seen: the Interface Kit's world handles the
// field's own `changed`, and the field and the Speech Box each raise one.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {buildDomainPalette} from '../domainBlocks';
import {projectOwnMetas, projectRuleMetas} from '../projectModules';
import {
  missingRuleOfBlockType,
  refFromValue,
  refResolves,
  registerProjectRules,
} from '../ruleRegistry';

/** Every block in a workspace, with the trait it names if it names one. */
interface Named {
  type: string;
  trait?: string;
}
const typesIn = (source: string): Named[] => {
  const found: Named[] = [];
  const visit = (block: unknown): void => {
    const one = block as {
      type?: string;
      fields?: Record<string, unknown>;
      inputs?: Record<string, {block?: unknown; shadow?: unknown}>;
      next?: {block?: unknown; shadow?: unknown};
    };
    if (!one?.type) {
      return;
    }
    const trait = one.fields?.TRAIT;
    found.push({
      type: one.type,
      trait: typeof trait === 'string' ? trait : undefined,
    });
    for (const input of Object.values(one.inputs ?? {})) {
      visit(input?.block ?? input?.shadow);
    }
    visit(one.next?.block ?? one.next?.shadow);
  };
  const roots = (JSON.parse(source) as {blocks?: {blocks?: unknown[]}}).blocks
    ?.blocks;
  for (const root of roots ?? []) {
    visit(root);
  }
  return found;
};

/**
 * What the warning would say about every block in the project, if anything.
 *
 * The same two questions `missingRuleFor` asks, in the same order: a `use
 * trait` names its trait in a FIELD, and every other member block is a type
 * minted for one member.
 */
const wouldWarn = (files: Record<string, string>): string[] => {
  const warned: string[] = [];
  for (const [path, source] of Object.entries(files)) {
    for (const {type, trait} of typesIn(source)) {
      const missing = trait
        ? refResolves(refFromValue(trait))
          ? undefined
          : refFromValue(trait).ruleName
        : missingRuleOfBlockType(type);
      if (missing) {
        warned.push(`${path}: ${type} → ${missing}`);
      }
    }
  }
  return [...new Set(warned)];
};

describe('the warning on a dead reference', () => {
  it('says nothing about a project that holds everything it names', () => {
    const files = projectFiles(WORLD_SCENARIOS.interface.source);
    const rules = projectRuleMetas(files);
    // The registries, filled the way the editor fills them before a file is
    // opened. Registering the member block types is what `buildDomainPalette`
    // does on the way past.
    registerProjectRules(rules);
    buildDomainPalette(rules, {
      allRuleModules: true,
      ownProperties: projectOwnMetas(files),
    });

    expect(wouldWarn(files)).toEqual([]);
  });

  it('still says so when a rule really has gone', () => {
    // The other half, and the reason the first is not simply "never warn": a
    // reference whose rule the project has dropped has to keep saying so.
    const files = projectFiles(WORLD_SCENARIOS.interface.source);
    const rules = projectRuleMetas(files);
    registerProjectRules(rules);
    buildDomainPalette(rules, {
      allRuleModules: true,
      ownProperties: projectOwnMetas(files),
    });

    // …and now the project loses one, as deleting its file does.
    registerProjectRules(rules.filter(rule => rule.name !== 'Tab Navigation'));

    expect(wouldWarn(files)).toContain(
      'actors/textInput.actor: world_get_TabNavigation_FocusedProperty → Tab Navigation',
    );
  });
});
