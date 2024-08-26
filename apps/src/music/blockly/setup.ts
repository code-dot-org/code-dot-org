import musicI18n from '../locale';

import {
  DEFAULT_TRACK_NAME_EXTENSION,
  DOCS_BASE_URL,
  FIELD_CHORD_TYPE,
  FIELD_PATTERN_TYPE,
  FIELD_PATTERN_AI_TYPE,
  FIELD_TUNE_TYPE,
  FIELD_SOUNDS_TYPE,
  PLAY_MULTI_MUTATOR,
  FIELD_EFFECTS_EXTENSION,
} from './constants';
import {
  getDefaultTrackNameExtension,
  playMultiMutator,
  effectsFieldExtension,
} from './extensions';
import FieldChord from './FieldChord';
import FieldPattern from './FieldPattern';
import FieldPatternAi from './FieldPatternAi';
import FieldSounds from './FieldSounds';
import FieldTune from './FieldTune';
import {MUSIC_BLOCKS} from './musicBlocks';
import {BlockConfig} from './types';

/**
 * Set up the global Blockly environment for Music Lab. This should
 * only be called once per page load, as it configures the global
 * Blockly state.
 */
export function setUpBlocklyForMusicLab() {
  Blockly.Extensions.register(
    DEFAULT_TRACK_NAME_EXTENSION,
    getDefaultTrackNameExtension()
  );

  Blockly.Extensions.register(FIELD_EFFECTS_EXTENSION, effectsFieldExtension);
  Blockly.Extensions.registerMutator(PLAY_MULTI_MUTATOR, playMultiMutator);

  // Needed for TypeScript to recognize the type of the MUSIC_BLOCKS. Remove
  // after converting musicBlocks to TypeScript.
  const typedMusicBlocks = MUSIC_BLOCKS as {[key: string]: BlockConfig};
  for (const blockType of Object.keys(typedMusicBlocks)) {
    const blockConfig = typedMusicBlocks[blockType] as BlockConfig;
    Blockly.Blocks[blockType] = {
      init: function () {
        this.jsonInit(blockConfig.definition);
      },
    };

    Blockly.JavaScript[blockType] = blockConfig.generator;
  }

  Blockly.cdoUtils.registerCustomProcedureBlocks();
  Blockly.fieldRegistry.register(FIELD_SOUNDS_TYPE, FieldSounds);
  Blockly.fieldRegistry.register(FIELD_PATTERN_TYPE, FieldPattern);
  Blockly.fieldRegistry.register(FIELD_PATTERN_AI_TYPE, FieldPatternAi);
  Blockly.fieldRegistry.register(FIELD_CHORD_TYPE, FieldChord);
  Blockly.fieldRegistry.register(FIELD_TUNE_TYPE, FieldTune);

  // Remove two default entries in the toolbox's Functions category that
  // we don't want.
  delete Blockly.Blocks.procedures_defreturn;
  delete Blockly.Blocks.procedures_ifreturn;

  // Rename the new function placeholder text for Music Lab specifically.
  Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE'] =
    musicI18n.blockly_functionNamePlaceholder();

  // Wrap the create function block's init function in a function that
  // sets the block's help URL to the appropriate entry in the Music Lab
  // docs, and calls the original init function if present.
  const functionBlock = Blockly.Blocks.procedures_defnoreturn;
  functionBlock.initOriginal = functionBlock.init;
  functionBlock.init = function () {
    this.setHelpUrl(DOCS_BASE_URL + 'create_function');
    this.initOriginal?.();
  };

  Blockly.setInfiniteLoopTrap();
}
