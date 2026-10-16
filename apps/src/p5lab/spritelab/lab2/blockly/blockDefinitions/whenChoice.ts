import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {choicesOf, SHOW_CHOICES_BLOCK_TYPE} from './showChoices';

export const WHEN_CHOICE_BLOCK_TYPE = 'spritelab2_whenChoice';
export const FIELD_CHOICE_DROPDOWN_TYPE = 'field_spritelab2_choice';

const NO_CHOICES_OPTION: [string, string] = ['(add show choices first)', ''];

/** Dropdown options from every show-choices block in the program, in
    block order, each word once. */
export function choiceMenuOptions(
  blocks: {getFieldValue: (name: string) => string | null}[]
): [string, string][] {
  const words: string[] = [];
  blocks.forEach(block =>
    choicesOf(name => block.getFieldValue(name)).forEach(word => {
      if (!words.includes(word)) {
        words.push(word);
      }
    })
  );
  return words.length ? words.map(word => [word, word]) : [NO_CHOICES_OPTION];
}

function workspaceChoiceOptions(): [string, string][] {
  const workspace = BlocklyCore.getMainWorkspace();
  return choiceMenuOptions(
    workspace ? workspace.getBlocksByType(SHOW_CHOICES_BLOCK_TYPE, true) : []
  );
}

/** Registered field type (see setup.ts): a dropdown whose options are the
    program's choices as they are typed. A value no block offers any more
    stays as the saved word until the student picks another. */
export class ChoiceDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new ChoiceDropdown(workspaceChoiceOptions);
  }

  protected override doClassValidation_(newValue?: string): string | null {
    return typeof newValue === 'string' ? newValue : null;
  }
}

/** Runs its blocks when the player picks this choice. */
const definition: BlockJson = {
  type: WHEN_CHOICE_BLOCK_TYPE,
  message0: 'when choice %1 %2 %3',
  args0: [
    {type: FIELD_CHOICE_DROPDOWN_TYPE, name: 'CHOICE'},
    {type: 'input_dummy', name: 'ROW'},
    {type: 'input_statement', name: 'DO'},
  ],
  style: BlockStyles.EVENT,
  tooltip: 'When the player picks this choice, these blocks run.',
};

const generator: GeneratorFunction = (block, generator) =>
  `whenChoice(${JSON.stringify(
    block.getFieldValue('CHOICE')
  )}, function () {\n${generator.statementToCode(block, 'DO')}});\n`;

export default {definition, generator};
