import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

import {JUMP_SPEED, PLAYER_2_GROUP} from './makePlatformPlayer';

/**
 * A second platform player, steered by W, A, S and D as the first is by
 * the arrow keys. Same physics and jump; its own group, so each key set
 * moves only its own player.
 */
const definition: BlockJson = {
  type: 'spritelab2_setAsPlatformPlayer2',
  message0: 'set %1 as player 2',
  args0: [{type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip: 'A second player, moved with W, A, S and D.',
};

const generator: GeneratorFunction = block =>
  `setAsPlatformPlayer2({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}});\n`;

const group = JSON.stringify(PLAYER_2_GROUP);

const helperCode = [
  // Guarded like wirePlatformControls: several of these blocks in one
  // program share one set of handlers.
  'var platformControls2Wired = false;',
  'function wirePlatformControls2() {',
  '  if (platformControls2Wired) {',
  '    return;',
  '  }',
  '  platformControls2Wired = true;',
  "  keyPressed('while', 'a', function () {",
  `    moveInDirection({group: ${group}}, getProp({group: ${group}}, 'speed'), 'West');`,
  '  });',
  "  keyPressed('while', 'd', function () {",
  `    moveInDirection({group: ${group}}, getProp({group: ${group}}, 'speed'), 'East');`,
  '  });',
  "  keyPressed('while', 'w', function () {",
  '    if (platformGravity() === 0) {',
  `      moveInDirection({group: ${group}}, getProp({group: ${group}}, 'speed'), 'North');`,
  '    }',
  '  });',
  "  keyPressed('when', 'w', function () {",
  '    if (platformGravity() !== 0) {',
  `      platformJump(${JUMP_SPEED}, ${group});`,
  '    }',
  '  });',
  "  keyPressed('while', 's', function () {",
  '    if (platformGravity() === 0) {',
  `      moveInDirection({group: ${group}}, getProp({group: ${group}}, 'speed'), 'South');`,
  '    }',
  '  });',
  '}',
  'function setAsPlatformPlayer2(spriteArg) {',
  `  setPlatformPlayer(spriteArg, ${group});`,
  '  wirePlatformControls2();',
  '}',
].join('\n');

export default {definition, generator, helperCode};
