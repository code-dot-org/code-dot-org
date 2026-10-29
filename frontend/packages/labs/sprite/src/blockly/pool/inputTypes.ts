// Apps' STANDARD_INPUT_TYPES and Sprite Lab's customInputTypes, building
// inputs in a block's init as block_utils did.
import * as BlocklyCore from 'blockly/core';
import {type JavascriptGenerator, Order} from 'blockly/javascript';

import {PLAY_SOUND_OPTIONS, SoundDropdown} from '../blockDefinitions/playSound';
import {CdoFieldBitmap} from '../fields/cdoFieldBitmap';
import {singleCellValidator} from '../gridFields';
import {animationPicker} from '../imagePickerFields';

import {
  DROPDOWN_INPUT,
  DUMMY_INPUT,
  FIELD_INPUT,
  INLINE_DUMMY_INPUT,
  STATEMENT_INPUT,
  VALUE_INPUT,
  VARIABLE_INPUT,
} from './inputs';
import {LocationField} from './locationField';
import type {InputType, LabeledInput} from './types';

/** Apps' BlockValueType values. */
export const BlockValueType = {
  NONE: 'None',
  STRING: 'String',
  NUMBER: 'Number',
  BOOLEAN: 'Boolean',
  COLOUR: 'Colour',
  ARRAY: 'Array',
  SPRITE: 'Sprite',
  BEHAVIOR: 'Behavior',
  LOCATION: 'Location',
} as const;

// A dropdown value that means "nothing chosen"; it is quoted like a string.
const EMPTY_OPTION = '???';
// A behavior dropdown with no behaviors to offer.
const NO_OPTIONS_MESSAGE = 'uninitialized';
const CLAMPED_NUMBER_REGEX =
  /^ClampedNumber\((-?\d*\.?\d*),\s*(-?\d*\.?\d*)\)$/;

/** A check of None accepts any block, which Blockly spells null. */
export function checkFor(type: string | undefined): string | null {
  return !type || type === BlockValueType.NONE ? null : type;
}

// Adds a second value to one-element options, which older blocks have.
function sanitizeOptions(options: string[][]): [string, string][] {
  return options.map(option =>
    option.length === 1 ? [option[0], option[0]] : [option[0], option[1]],
  );
}

function name(input: LabeledInput): string {
  return input.name as string;
}

export const STANDARD_INPUT_TYPES: Record<string, InputType> = {
  [VALUE_INPUT]: {
    addInputRow(_blockly, block, input) {
      return block
        .appendValueInput(name(input))
        .setAlign(BlocklyCore.inputs.Align.RIGHT)
        .setCheck(checkFor(input.type));
    },
    generateCode(block, input, generator) {
      return generator.valueToCode(block, name(input), Order.COMMA);
    },
  },
  [STATEMENT_INPUT]: {
    addInputRow(_blockly, block, input) {
      return block.appendStatementInput(name(input));
    },
    generateCode(block, input, generator) {
      return `function () {\n${generator.statementToCode(block, name(input))}}`;
    },
  },
  [INLINE_DUMMY_INPUT]: {
    addInput(_blockly, _block, input, row) {
      const image = input.customOptions;
      if (image?.assetUrl) {
        row
          .appendField(input.label ?? '')
          .appendField(
            new BlocklyCore.FieldImage(
              image.assetUrl,
              image.width ?? 0,
              image.height ?? 0,
            ),
          );
      }
    },
    generateCode: () => null,
  },
  [DUMMY_INPUT]: {
    addInputRow(_blockly, block) {
      return block.appendEndRowInput();
    },
    generateCode: () => null,
  },
  [DROPDOWN_INPUT]: {
    addInput(_blockly, _block, input, row) {
      row
        .appendField(input.label ?? '')
        .appendField(
          new BlocklyCore.FieldDropdown(sanitizeOptions(input.options ?? [])),
          name(input),
        );
    },
    generateCode(block, input) {
      let code = block.getFieldValue(name(input)) as string;
      if (
        (input.type === BlockValueType.STRING || code === EMPTY_OPTION) &&
        !code.startsWith('"') &&
        !code.startsWith("'")
      ) {
        code = JSON.stringify(code);
      }
      return code;
    },
  },
  [VARIABLE_INPUT]: {
    addInput(_blockly, _block, input, row) {
      row
        .appendField(input.label ?? '')
        .appendField(new BlocklyCore.FieldVariable(null), name(input));
    },
    generateCode(block, input, generator) {
      return generator.getVariableName(block.getFieldValue(name(input)));
    },
  },
  [FIELD_INPUT]: {
    addInput(_blockly, _block, input, row) {
      const type = input.type ?? '';
      let field: BlocklyCore.Field;
      const clamped = type.match(CLAMPED_NUMBER_REGEX);
      if (type === BlockValueType.NUMBER) {
        field = new BlocklyCore.FieldNumber();
      } else if (clamped) {
        field = new BlocklyCore.FieldNumber(
          0,
          parseFloat(clamped[1]),
          parseFloat(clamped[2]),
        );
      } else {
        field = new BlocklyCore.FieldTextInput();
      }
      row.appendField(input.label ?? '').appendField(field, name(input));
    },
    generateCode(block, input) {
      const code = block.getFieldValue(name(input));
      return input.type === BlockValueType.STRING
        ? JSON.stringify(code)
        : String(code);
    },
  },
};

// The 8x8 grid a bitmap input paints, as apps configured it.
const BITMAP_CONFIG = {
  height: 8,
  width: 8,
  fieldHeight: 42,
  buttons: {randomize: false, clear: true},
};

function bitmapInputType(
  validator: typeof singleCellValidator | null,
): InputType {
  return {
    addInput(_blockly, _block, input, row) {
      row.appendField(input.label ?? '').appendField(
        new CdoFieldBitmap(
          Array.from({length: 8}, () => new Array<number>(8).fill(0)),
          validator ?? undefined,
          BITMAP_CONFIG,
        ),
        name(input),
      );
    },
    generateCode(block, input) {
      return JSON.stringify(block.getFieldValue(name(input)));
    },
  };
}

/**
 * The sound library's picker, as a dropdown of the lab's sounds. A saved
 * sound the list lacks stays chosen, so loading a block keeps its sound.
 */
class PoolSoundDropdown extends SoundDropdown {
  constructor() {
    super(function (this: BlocklyCore.FieldDropdown) {
      const value = this.getValue();
      return value && !PLAY_SOUND_OPTIONS.some(([, v]) => v === value)
        ? [...PLAY_SOUND_OPTIONS, [value, value]]
        : PLAY_SOUND_OPTIONS;
    });
  }
}

// The sprite pointer blocks' labels, from apps' spritelab strings.
const POINTER_LABELS: Record<string, [label: string, code: string]> = {
  gamelab_clickedSpritePointer: ['clicked sprite', 'clickedSprite'],
  gamelab_newSpritePointer: ['new sprite', 'newSprite'],
  gamelab_subjectSpritePointer: ['subject sprite', 'subjectSprite'],
  gamelab_objectSpritePointer: ['object sprite', 'objectSprite'],
};

export const SPRITE_LAB_INPUT_TYPES: Record<string, InputType> = {
  costumePicker: animationPicker('costume') as unknown as InputType,
  backgroundPicker: animationPicker('background') as unknown as InputType,
  bitmap: bitmapInputType(null),
  bitmapSingle: bitmapInputType(singleCellValidator),
  locationPicker: {
    addInput(_blockly, _block, input, row) {
      row.appendField(input.label ?? '', `${name(input)}_LABEL`);
      row.appendField(
        new LocationField() as unknown as BlocklyCore.Field,
        name(input),
      );
    },
    generateCode(block, input) {
      return `(${block.getFieldValue(name(input))})`;
    },
  },
  soundPicker: {
    addInput(_blockly, _block, input, row) {
      row
        .appendField(input.label ?? '')
        .appendField(new PoolSoundDropdown(), name(input));
    },
    generateCode(block, input) {
      return JSON.stringify(block.getFieldValue(name(input)));
    },
  },
  // Apps drew the pointed-at sprite's picture here; the label alone is
  // what it showed without one.
  spritePointer: {
    addInput(_blockly, block, input, row) {
      const [label] = POINTER_LABELS[block.type] ?? [''];
      row
        .appendField(label)
        .appendField(new BlocklyCore.FieldLabel(''), name(input));
    },
    generateCode(block) {
      const pointer = POINTER_LABELS[block.type];
      return pointer ? `{id: extraArgs.${pointer[1]}}` : undefined;
    },
  },
  spritePicker: {
    addInput(_blockly, _block, input, row) {
      row
        .appendField(input.label ?? '')
        .appendField(
          new BlocklyCore.FieldVariable(
            null,
            undefined,
            [BlockValueType.SPRITE],
            BlockValueType.SPRITE,
          ),
          name(input),
        );
    },
    generateCode(block, input, generator) {
      return `{name: '${generator.getVariableName(block.getFieldValue(name(input)))}'}`;
    },
  },
  // Apps' Lab2 offers no way to define a behavior (the modal behavior
  // editor is legacy Sprite Lab's), so the list is always empty, as there.
  behaviorPicker: {
    addInput(_blockly, _block, input, row) {
      row
        .appendField(input.label ?? '')
        .appendField(
          new BlocklyCore.FieldDropdown([
            ['No behaviors found', NO_OPTIONS_MESSAGE],
          ]),
          name(input),
        );
    },
    generateCode: () => undefined,
  },
  // The variable's name, not its value.
  variableNamePicker: {
    addInputRow(_blockly, block, input) {
      return block.appendValueInput(name(input));
    },
    generateCode(block, input, generator) {
      const target = block.getInput(name(input))?.connection?.targetBlock();
      if (target?.type === 'variables_get') {
        const [code] = generator.blockToCode(target) as [string, number];
        return `'${code}'`;
      }
      return '';
    },
  },
  variableFieldNamePicker: {
    addInput(_blockly, _block, input, row) {
      row
        .appendField(input.label ?? '')
        .appendField(new BlocklyCore.FieldVariable(null), name(input));
    },
    generateCode(block, input, generator) {
      const id = block.getFieldValue(name(input));
      const label = block.workspace
        .getVariableMap()
        .getVariableById(id)
        ?.getName();
      return [`"${label}"`, `"${generator.getVariableName(id)}"`];
    },
  },
};

export type {JavascriptGenerator};
