import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const SHOW_CHOICES_BLOCK_TYPE = 'spritelab2_showChoices';
export const CHOICE_FIELDS = ['CHOICE1', 'CHOICE2', 'CHOICE3'] as const;

/** The block's choices, in order, blanks left out. */
export function choicesOf(
  getFieldValue: (name: string) => string | null
): string[] {
  return CHOICE_FIELDS.map(name => (getFieldValue(name) ?? '').trim()).filter(
    Boolean
  );
}

// Two or three choices, typed on the block; a blank third is no third.
const definition: BlockJson = {
  type: SHOW_CHOICES_BLOCK_TYPE,
  message0: 'show choices %1 %2 %3',
  args0: [
    {type: 'field_input', name: 'CHOICE1', text: 'Yes'},
    {type: 'field_input', name: 'CHOICE2', text: 'No'},
    {type: 'field_input', name: 'CHOICE3', text: ''},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Buttons with these words appear under the game until the player ' +
    'picks one. "when choice" runs the blocks for the one picked.',
};

const generator: GeneratorFunction = block =>
  `showChoices(${JSON.stringify(
    choicesOf(name => block.getFieldValue(name))
  )});\n`;

export default {definition, generator};
