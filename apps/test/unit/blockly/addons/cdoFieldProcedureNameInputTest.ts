import * as BlocklyCore from 'blockly/core';

import CdoFieldProcedureNameInput from '@cdo/apps/blockly/addons/cdoFieldProcedureNameInput';
import {blocks as behaviorBlocks} from '@cdo/apps/blockly/customBlocks/behaviorBlocks';
import {registerCustomProcedureBlocks} from '@cdo/apps/blockly/utils/blocks/register';
import {setCurriculumProcedureNames} from '@cdo/apps/blockly/utils/localization/procedureNameRegistry';
import localization from '@cdo/apps/localization';

import setBlocklyGlobal from '../../../util/setupBlocklyGlobal';

setBlocklyGlobal();
registerCustomProcedureBlocks();
BlocklyCore.common.defineBlocks(behaviorBlocks);

const TRANSLATIONS: {[source: string]: string} = {
  jump: 'saltar',
  '[behavior] wandering': '[behavior] deambulando',
};

// The editor's protected hooks, which a headless test cannot reach by
// opening the real editor.
type EditorHooks = {
  nameAtEdit_: string;
  getEditorText_(value: unknown): string;
  getValueFromEditorText_(text: string): string;
};

function nameField(type: string, name: string) {
  const workspace = new BlocklyCore.Workspace();
  const block = workspace.newBlock(type);
  block.setFieldValue(name, 'NAME');
  const field = block.getField('NAME') as CdoFieldProcedureNameInput;
  return {workspace, block, field, hooks: field as unknown as EditorHooks};
}

describe('CdoFieldProcedureNameInput', () => {
  let workspace: BlocklyCore.Workspace | undefined;

  beforeEach(() => {
    jest
      .spyOn(localization, 'translate')
      .mockImplementation(
        (text: unknown) => (TRANSLATIONS[text as string] ?? text) as never
      );
    setCurriculumProcedureNames({
      toolbox: {
        kind: 'flyoutToolbox',
        contents: [
          {
            kind: 'block',
            type: 'procedures_callnoreturn',
            extraState: {name: 'jump'},
          },
          {
            kind: 'block',
            type: 'gamelab_behavior_get',
            fields: {NAME: 'wandering'},
          },
        ],
      },
    });
  });

  afterEach(() => {
    workspace?.dispose();
    workspace = undefined;
    setCurriculumProcedureNames({});
    jest.restoreAllMocks();
  });

  it('is the NAME field of both definition blocks', () => {
    for (const type of ['procedures_defnoreturn', 'behavior_definition']) {
      const made = nameField(type, 'x');
      workspace = made.workspace;
      expect(made.field).toBeInstanceOf(CdoFieldProcedureNameInput);
      workspace.dispose();
    }
    workspace = undefined;
  });

  it('displays the translation and stores the original name', () => {
    const made = nameField('procedures_defnoreturn', 'jump');
    workspace = made.workspace;
    expect(made.field.getText()).toBe('saltar');
    expect(made.block.getFieldValue('NAME')).toBe('jump');
  });

  it('uses the behavior translation on a behavior definition', () => {
    const made = nameField('behavior_definition', 'wandering');
    workspace = made.workspace;
    expect(made.field.getText()).toBe('deambulando');
  });

  it('displays a name the level did not author as stored', () => {
    const made = nameField('procedures_defnoreturn', 'my dance');
    workspace = made.workspace;
    expect(made.field.getText()).toBe('my dance');
  });

  it('opens the editor on the translation', () => {
    const made = nameField('procedures_defnoreturn', 'jump');
    workspace = made.workspace;
    expect(made.hooks.getEditorText_('jump')).toBe('saltar');
  });

  it('keeps the original name when the translation is committed unchanged', () => {
    const made = nameField('procedures_defnoreturn', 'jump');
    workspace = made.workspace;
    made.hooks.nameAtEdit_ = 'jump';
    expect(made.hooks.getValueFromEditorText_('saltar')).toBe('jump');
    expect(made.hooks.getValueFromEditorText_(' saltar ')).toBe('jump');
  });

  it('takes any other text as the new name', () => {
    const made = nameField('procedures_defnoreturn', 'jump');
    workspace = made.workspace;
    made.hooks.nameAtEdit_ = 'jump';
    expect(made.hooks.getValueFromEditorText_('saltar alto')).toBe(
      'saltar alto'
    );
    expect(made.hooks.getValueFromEditorText_('jump')).toBe('jump');
  });

  it('maps back only to the name being edited', () => {
    const made = nameField('procedures_defnoreturn', 'my dance');
    workspace = made.workspace;
    made.hooks.nameAtEdit_ = 'my dance';
    expect(made.hooks.getValueFromEditorText_('saltar')).toBe('saltar');
  });

  it('serializes the original name', () => {
    const made = nameField('procedures_defnoreturn', 'jump');
    workspace = made.workspace;
    const state = JSON.stringify(
      BlocklyCore.serialization.workspaces.save(workspace)
    );
    expect(state).toContain('"jump"');
    expect(state).not.toContain('saltar');
  });
});
