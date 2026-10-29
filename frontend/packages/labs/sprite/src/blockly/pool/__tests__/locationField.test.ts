import * as Blockly from 'blockly/core';
import {afterEach, beforeAll, beforeEach, expect, it, vi} from 'vitest';

import {
  LocationField,
  type LocationPicker,
  setLocationPicker,
} from '../locationField';

let workspace: Blockly.Workspace;
let field: LocationField;

beforeAll(() => {
  Blockly.Blocks['test_location'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new LocationField('{"x":10,"y":300}') as unknown as Blockly.Field,
        'LOCATION',
      );
      this.setOutput(true);
    },
  };
  Blockly.Blocks['test_sprite'] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new Blockly.FieldTextInput('"Hero"'),
        'ANIMATION_NAME',
      );
      this.appendValueInput('LOCATION');
    },
  };
});

beforeEach(() => {
  workspace = new Blockly.Workspace();
  const sprite = workspace.newBlock('test_sprite');
  const location = workspace.newBlock('test_location');
  sprite.getInput('LOCATION')?.connection?.connect(location.outputConnection!);
  field = location.getField('LOCATION') as unknown as LocationField;
});

afterEach(() => {
  setLocationPicker(null);
  workspace.dispose();
});

function openEditor() {
  (field as unknown as {showEditor_: () => void}).showEditor_();
}

it('shows y counting up from the bottom', () => {
  expect(field.getText()).toBe('(10, 100) \u{1F4CD}');
});

it('asks the picker, naming the costume of the block it sits in', () => {
  const picker = vi.fn<LocationPicker>();
  setLocationPicker(picker);
  openEditor();
  expect(picker).toHaveBeenCalledWith(
    {x: 10, y: 300},
    expect.any(Function),
    expect.any(Function),
    'Hero',
  );
});

it('follows the picker, and a cancelled pick restores the value', () => {
  let onUpdate: Parameters<LocationPicker>[1] = () => {};
  let onDone: Parameters<LocationPicker>[2] = () => {};
  setLocationPicker((_initial, update, done) => {
    onUpdate = update;
    onDone = done;
  });
  openEditor();
  onUpdate({x: 50, y: 60});
  expect(field.getValue()).toBe('{"x":50,"y":60}');
  onDone(null);
  expect(field.getValue()).toBe('{"x":10,"y":300}');

  openEditor();
  onUpdate({x: 70, y: 80});
  onDone({x: 70, y: 80});
  expect(field.getValue()).toBe('{"x":70,"y":80}');
});

it('does nothing with no picker registered', () => {
  expect(() => openEditor()).not.toThrow();
});
