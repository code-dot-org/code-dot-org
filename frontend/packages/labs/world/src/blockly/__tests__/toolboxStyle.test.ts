// WHEN the toolbox's stylesheet is registered, which is the whole of what this
// file is about.
//
// Blockly keeps registered CSS in a buffer and turns it into one
// `<style id="blockly-common-style">` the first time it injects a workspace
// into a document. That buffer then closes: a later `Blockly.Css.register` is
// text nobody reads. The lab injects an offscreen workspace at startup
// (`BlocklyGenerator`), so anything that waits for a `.rule` file to be opened
// before registering has already missed it — which is how the toolbox came up
// in Blockly's own gray when the lab loaded on the map editor and the learner
// clicked through to a rule afterwards.
//
// The claim, therefore, is about IMPORTING and not about calling: loading the
// module is enough, and `DesignSystemToolboxPlugin.initialize` is deliberately
// never called here.

import {describe, expect, it, vi} from 'vitest';

import {Blockly, type Toolbox} from '@code-dot-org/blockly';

import '../toolboxStyle';

describe('the toolbox stylesheet', () => {
  it('is registered by importing the module, before anything injects', () => {
    // Blockly offers no way to read the buffer, so this asks for the buffer to
    // be spent: `Css.inject` is what a workspace injection calls, and it writes
    // the one style element there will ever be for this document.
    Blockly.Css.inject(document.body, true, '');

    const sheet = document.getElementById('blockly-common-style');
    expect(sheet).not.toBeNull();
    // A selector only this lab writes. Blockly's own base CSS names most of
    // the toolbox classes we restyle, so asking for one of those would pass
    // over a stylesheet that never made it in.
    expect(sheet!.textContent).toContain('.worldToolboxHeading');
  });
});

describe('Add Rules at the foot of the toolbox', () => {
  // specs/SHELL_PLAN.md, step 6. The item is built as the toolbox builds
  // it, from the registry, without a workspace around it.
  it('is the last row, and opens the rule import dialog', async () => {
    const {DesignSystemToolboxPlugin, TOOLBOX_ADD_RULES, withAddRules} =
      await import('../toolboxStyle');
    const {setRuleImportHandler} = await import('../ruleImport');
    // A global plugin: initializing it is what registers the item.
    (DesignSystemToolboxPlugin as {initialize: () => void}).initialize();

    const rows = withAddRules([
      {kind: 'category', name: 'Logic', contents: []},
    ] as unknown as Toolbox) as Array<{kind: string}>;
    expect(rows.map(row => row.kind)).toEqual(['category', TOOLBOX_ADD_RULES]);

    const Item = Blockly.registry.getClass(
      Blockly.registry.Type.TOOLBOX_ITEM,
      TOOLBOX_ADD_RULES,
    )!;
    const toolbox = {getWorkspace: () => ({})};
    const item = new Item(rows[1] as never, toolbox as never);
    item.init();
    const button = item.getDiv()!.querySelector('button')!;
    expect(button.textContent).toBe('Add Rules');

    const asked = vi.fn(async () => undefined);
    setRuleImportHandler(asked);
    button.click();
    expect(asked).toHaveBeenCalledTimes(1);
    setRuleImportHandler(null);
  });
});
