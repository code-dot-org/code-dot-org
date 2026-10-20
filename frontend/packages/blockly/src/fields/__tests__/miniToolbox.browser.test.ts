// The mini toolbox: a `+` on a block that opens a flyout of blocks inside it.
//
// A BROWSER test, because the field only exists where there is something to
// draw: it injects a real workspace, and jsdom cannot parse the stylesheet
// Blockly installs on the way in.
//
// What is checked here is the arrangement — the toggle goes on, and the
// workspace is told what the flyout contains, keyed per block. The property
// that matters most, that a block dragged OUT of the flyout lands in the
// workspace, needs a real drag and is checked in world lab, where the
// affordance is used.

import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {addMiniToolbox, FieldFlyout} from '../miniToolbox';

// `inject` reads messages for its ARIA labels, and a test runner loads none —
// the symptom is a `.replace` of undefined from inside `updateAriaLabel`.
Blockly.setLocale(En as unknown as {[key: string]: string});

const HAT = 'test_hat';
const OFFERED = 'test_offered';

Blockly.defineBlocksWithJsonArray([
  {type: HAT, message0: 'when something happens', nextStatement: null},
  {type: OFFERED, message0: 'the thing', output: null},
]);

/** A rendered workspace: the field only builds where there is something to draw. */
let workspace: Blockly.WorkspaceSvg;

beforeEach(() => {
  document.body.innerHTML =
    '<div id="ws" style="width:800px;height:600px"></div>';
  workspace = Blockly.inject('ws', {});
});

const toggleField = (block: Blockly.Block) =>
  block.inputList[0]?.fieldRow.find(field => field.name?.endsWith('_TOGGLE'));

describe('mini-toolbox.md: addMiniToolbox', () => {
  it('MT-1: puts the toggle at the front of the first row', () => {
    // First, because it reads as a control on the whole block rather than as
    // part of the sentence — the same place Blockly puts a mutator icon.
    const block = workspace.newBlock(HAT) as Blockly.BlockSvg;
    block.initSvg();
    addMiniToolbox(block, {blocks: [OFFERED]});

    expect(block.inputList[0].fieldRow[0]).toBe(toggleField(block));
  });

  it('MT-1, MT-4: builds nothing until the toggle is pressed', () => {
    // A shut mini toolbox costs the block a button and nothing else: no flyout
    // is constructed, and no input carries one.
    const block = workspace.newBlock(HAT) as Blockly.BlockSvg;
    block.initSvg();
    addMiniToolbox(block, {blocks: [OFFERED]});

    expect(block.getInput('MINI_TOOLBOX_FLYOUT')).toBeNull();
  });

  it('MT-3, MT-V1: tells the workspace what the flyout holds, keyed by BLOCK', () => {
    // Not by type: two hats of one kind each get their own flyout, and a
    // callback shared between them would hand the second the first's contents.
    const first = workspace.newBlock(HAT) as Blockly.BlockSvg;
    const second = workspace.newBlock(HAT) as Blockly.BlockSvg;
    first.initSvg();
    second.initSvg();
    addMiniToolbox(first, {blocks: [OFFERED]});
    addMiniToolbox(second, {blocks: [OFFERED]});

    const callbacks = (
      workspace as unknown as {flyoutButtonCallbacks?: Map<string, unknown>} & {
        toolboxCategoryCallbacks: Map<string, unknown>;
      }
    ).toolboxCategoryCallbacks;

    expect(callbacks.has(`flyout_${HAT}_${first.id}`)).toBe(true);
    expect(callbacks.has(`flyout_${HAT}_${second.id}`)).toBe(true);
  });

  it('MT-3: offers exactly the blocks it was given', () => {
    const block = workspace.newBlock(HAT) as Blockly.BlockSvg;
    block.initSvg();
    addMiniToolbox(block, {blocks: [OFFERED]});

    const callback = (
      workspace as unknown as {
        toolboxCategoryCallbacks: Map<
          string,
          () => Array<{kind: string; type: string}>
        >;
      }
    ).toolboxCategoryCallbacks.get(`flyout_${HAT}_${block.id}`)!;

    expect(callback().map(item => item.type)).toEqual([OFFERED]);
  });

  it('MT-1: is applied once, however many times it is asked for', () => {
    // An extension can run again on a block that is reloaded; a second toggle
    // would sit beside the first and open a flyout the first cannot close.
    const block = workspace.newBlock(HAT) as Blockly.BlockSvg;
    block.initSvg();
    addMiniToolbox(block, {blocks: [OFFERED]});
    addMiniToolbox(block, {blocks: [OFFERED]});

    const toggles = block.inputList[0].fieldRow.filter(field =>
      field.name?.endsWith('_TOGGLE'),
    );
    expect(toggles).toHaveLength(1);
  });
});

// Press the toggle as a click would.
const press = (block: Blockly.Block) =>
  (toggleField(block) as unknown as {onClick: () => void}).onClick();

// A hat that adds its mini toolbox in init, as a lab's block would.
const MINI_HAT = 'test_mini_hat';
Blockly.Blocks[MINI_HAT] = {
  init(this: Blockly.BlockSvg) {
    this.appendDummyInput().appendField('when');
    this.setNextStatement(true);
    addMiniToolbox(this, {blocks: [OFFERED]});
  },
};

describe('mini-toolbox.md: the toggle', () => {
  it('MT-4, MT-5: opens a flyout aimed at the block workspace, and shuts it', () => {
    const block = Blockly.serialization.blocks.append(
      {type: MINI_HAT},
      workspace,
    ) as Blockly.BlockSvg;

    press(block);
    const field = block
      .getInput('MINI_TOOLBOX_FLYOUT')
      ?.fieldRow.find(each => each instanceof FieldFlyout);
    const flyout = (
      field as unknown as {flyout: Blockly.HorizontalFlyout} | undefined
    )?.flyout;
    expect(flyout?.targetWorkspace).toBe(workspace);
    expect(
      flyout
        ?.getWorkspace()
        .getTopBlocks(false)
        .map(each => each.type),
    ).toEqual([OFFERED]);

    press(block);
    expect(block.getInput('MINI_TOOLBOX_FLYOUT')).toBeNull();
  });
});

describe('mini-toolbox.md: pressing', () => {
  it('MT-4: opens when the toggle is pressed with the pointer', () => {
    const block = Blockly.serialization.blocks.append(
      {type: MINI_HAT},
      workspace,
    ) as Blockly.BlockSvg;
    const target = toggleField(block)!.getSvgRoot()!;
    target.dispatchEvent(
      new PointerEvent('pointerdown', {bubbles: true, isPrimary: true}),
    );
    expect(block.getInput('MINI_TOOLBOX_FLYOUT')).not.toBeNull();
  });
});

describe('mini-toolbox.md: saving', () => {
  it('MT-7, MT-V2: saves an open flyout as apps does and loads it open', () => {
    const block = Blockly.serialization.blocks.append(
      {type: MINI_HAT},
      workspace,
    ) as Blockly.BlockSvg;
    press(block);

    const saved = Blockly.serialization.blocks.save(block)!;
    expect(saved.fields).toBeUndefined();
    expect(saved.extraState).toEqual({useDefaultIcon: false});

    const loaded = Blockly.serialization.blocks.append(
      saved,
      workspace,
    ) as Blockly.BlockSvg;
    expect(loaded.getInput('MINI_TOOLBOX_FLYOUT')).not.toBeNull();
  });

  it('MT-7: saves nothing for a shut flyout', () => {
    const block = Blockly.serialization.blocks.append(
      {type: MINI_HAT},
      workspace,
    ) as Blockly.BlockSvg;
    expect(Blockly.serialization.blocks.save(block)).not.toHaveProperty(
      'extraState',
    );
    expect(Blockly.serialization.blocks.save(block)).not.toHaveProperty(
      'fields',
    );
  });

  it('MT-7: loads headless without a warning', () => {
    const block = Blockly.serialization.blocks.append(
      {type: MINI_HAT},
      workspace,
    ) as Blockly.BlockSvg;
    press(block);
    const saved = Blockly.serialization.blocks.save(block)!;
    const warn = vi.spyOn(console, 'warn');
    const headless = new Blockly.Workspace();
    Blockly.serialization.blocks.append(saved, headless);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    headless.dispose();
  });

  it("MT-7: keeps the block's own extra state", () => {
    const OWN = 'test_mini_own';
    Blockly.Blocks[OWN] = {
      count: 0,
      init(this: Blockly.BlockSvg) {
        this.appendDummyInput().appendField('when');
        addMiniToolbox(this, {blocks: [OFFERED]});
      },
      saveExtraState(this: {count: number}) {
        return {count: this.count};
      },
      loadExtraState(this: {count: number}, state: {count: number}) {
        this.count = state.count;
      },
    };
    const block = Blockly.serialization.blocks.append(
      {type: OWN, extraState: {count: 3}},
      workspace,
    ) as Blockly.BlockSvg;
    press(block);
    expect(Blockly.serialization.blocks.save(block)?.extraState).toEqual({
      count: 3,
      useDefaultIcon: false,
    });
  });
});
