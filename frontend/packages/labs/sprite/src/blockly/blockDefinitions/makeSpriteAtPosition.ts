import {noteImageFieldValue} from '../../imageReferences';
import {BlockStyles} from '../constants';
import {COSTUME_FIELD} from '../imagePickerFields';
import {type BlockJson, type GeneratorFunction} from '../types';

const definition: BlockJson = {
  type: 'spritelab2_makeSpriteAtPosition',
  message0: 'make new %1 sprite at %2',
  args0: [
    {type: COSTUME_FIELD, name: 'ANIMATION_NAME'},
    {
      type: 'field_dropdown',
      name: 'POSITION',
      options: [
        ['left', 'left'],
        ['center', 'center'],
        ['right', 'right'],
      ],
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.SPRITE,
};

// Runtime half is an engine command (SpriteLab2Engine.createLibrary): it
// needs the native sprite to mirror the right-lane character.
const generator: GeneratorFunction = block =>
  `makeSpriteAtPosition(${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME'),
  )}, '${block.getFieldValue('POSITION')}');\n`;

export default {definition, generator};
