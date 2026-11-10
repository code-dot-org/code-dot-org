// Ported from apps' blockUtils.karma.test.js (determineInputs and
// groupInputsByRow).
import {describe, expect, it} from 'vitest';

import {determineInputs, groupInputsByRow} from '../inputs';
import {BlockValueType, STANDARD_INPUT_TYPES} from '../inputTypes';
import type {LabeledInput} from '../types';

const TEST_SPRITES = [
  ['dog', '"dog"'],
  ['cat', '"cat"'],
];

describe('groupInputsByRow', () => {
  const valueInput1: LabeledInput = {
    mode: 'value',
    name: 'VALUE1',
    label: 'hello',
  };
  const valueInput2: LabeledInput = {
    mode: 'value',
    name: 'VALUE2',
    label: 'world',
  };
  const fieldInput: LabeledInput = {
    mode: 'dropdown',
    name: 'DROPDOWN',
    label: 'foo',
  };
  const dummyInput: LabeledInput = {mode: 'dummy'};
  const group = (inputs: LabeledInput[]) =>
    groupInputsByRow(inputs, STANDARD_INPUT_TYPES);

  it('groups a single value input as one row', () => {
    expect(group([valueInput1])).toEqual([[valueInput1]]);
  });

  it('groups two value inputs as two rows', () => {
    expect(group([valueInput1, valueInput2])).toEqual([
      [valueInput1],
      [valueInput2],
    ]);
  });

  it('groups a field and value input as one row', () => {
    expect(group([fieldInput, valueInput1])).toEqual([
      [fieldInput, valueInput1],
    ]);
  });

  it('groups a value and field input as two rows with a dummy input on the second', () => {
    expect(group([valueInput1, fieldInput])).toEqual([
      [valueInput1],
      [fieldInput, dummyInput],
    ]);
  });

  it('groups a field and two value inputs as two rows', () => {
    expect(group([fieldInput, valueInput1, valueInput2])).toEqual([
      [fieldInput, valueInput1],
      [valueInput2],
    ]);
  });
});

describe('determineInputs', () => {
  // Apps passed the number 5 as a type; any opaque type will do.
  const NUMBER = BlockValueType.NUMBER;

  it('creates a single dummy input for no inputs', () => {
    expect(determineInputs('block text', [])).toEqual([
      {mode: 'dummy', label: 'block text'},
    ]);
  });

  it('creates a dropdown input', () => {
    const inputs = determineInputs('create a {ANIMATION} sprite', [
      {name: 'ANIMATION', options: TEST_SPRITES},
    ]);
    expect(inputs).toEqual([
      {
        mode: 'dropdown',
        name: 'ANIMATION',
        label: 'create a ',
        options: TEST_SPRITES,
        strict: false,
      },
      {mode: 'dummy', label: ' sprite'},
    ]);
  });

  it('creates a value input', () => {
    const inputs = determineInputs('move {DISTANCE} pixels', [
      {name: 'DISTANCE', type: NUMBER},
    ]);
    expect(inputs).toEqual([
      {
        mode: 'value',
        name: 'DISTANCE',
        type: NUMBER,
        label: 'move ',
        strict: false,
      },
      {mode: 'dummy', label: ' pixels'},
    ]);
  });

  it('creates both inputs', () => {
    const inputs = determineInputs('create a {ANIMATION} sprite at {X} {Y}', [
      {name: 'ANIMATION', options: TEST_SPRITES},
      {name: 'X', type: NUMBER},
      {name: 'Y', type: NUMBER},
    ]);
    expect(inputs).toEqual([
      {
        mode: 'dropdown',
        name: 'ANIMATION',
        options: TEST_SPRITES,
        label: 'create a ',
        strict: false,
      },
      {
        mode: 'value',
        name: 'X',
        type: NUMBER,
        label: ' sprite at ',
        strict: false,
      },
      {mode: 'value', name: 'Y', type: NUMBER, label: ' ', strict: false},
    ]);
  });

  it('removes trailing empty strings', () => {
    const inputs = determineInputs('set speed to {SPEED}', [
      {name: 'SPEED', type: NUMBER},
    ]);
    expect(inputs).toEqual([
      {
        mode: 'value',
        name: 'SPEED',
        type: NUMBER,
        label: 'set speed to ',
        strict: false,
      },
    ]);
  });

  it('adds a dummy input for newlines', () => {
    expect(determineInputs('this block has \n two lines', [])).toEqual([
      {mode: 'dummy', label: 'this block has '},
      {mode: 'dummy', label: ' two lines'},
    ]);
  });

  it('adds a dummy input for multiple newlines', () => {
    const inputs = determineInputs(
      'this block has \n three lines {WITH}\n a field input',
      [{name: 'WITH', field: true}],
    );
    expect(inputs).toEqual([
      {mode: 'dummy', label: 'this block has '},
      {name: 'WITH', mode: 'field', label: ' three lines ', strict: false},
      {mode: 'dummy', label: ''},
      {mode: 'dummy', label: ' a field input'},
    ]);
  });
});
