import {Triggers} from '../constants';
import musicI18n from '../locale';

import {backupFunctionDefinitons} from './blockUtils';
import {
  DEFAULT_TRACK_NAME_EXTENSION,
  FIELD_CHORD_TYPE,
  FIELD_PATTERN_TYPE,
  FIELD_PATTERN_AI_TYPE,
  FIELD_TUNE_TYPE,
  FIELD_SOUNDS_TYPE,
  PLAY_MULTI_MUTATOR,
  FIELD_EFFECTS_EXTENSION,
  FIELD_SOUNDS_VALIDATOR,
  FIELD_PATTERNS_VALIDATOR,
  NEXT_CONNECTION_MUTATOR,
} from './constants';
import {
  getDefaultTrackNameExtension,
  playMultiMutator,
  effectsFieldExtension,
  fieldSoundsValidator,
  fieldPatternsValidator,
  nextConnectionMutator,
} from './extensions';
import FieldChord from './FieldChord';
import FieldPattern from './FieldPattern';
import FieldPatternAi from './FieldPatternAi';
import FieldSounds from './FieldSounds';
import FieldTune from './FieldTune';
import {MUSIC_BLOCKS} from './musicBlocks';
import {MusicBlockConfig} from './types';

/**
 * Set up the global Blockly environment for Music Lab. This should
 * only be called once per page load, as it configures the global
 * Blockly state.
 */
export function setUpBlocklyForMusicLab() {
  backupFunctionDefinitons();

  safeRegisterExtension(
    DEFAULT_TRACK_NAME_EXTENSION,
    getDefaultTrackNameExtension()
  );
  safeRegisterExtension(FIELD_EFFECTS_EXTENSION, effectsFieldExtension);
  safeRegisterExtension(FIELD_SOUNDS_VALIDATOR, fieldSoundsValidator);
  safeRegisterExtension(FIELD_PATTERNS_VALIDATOR, fieldPatternsValidator);

  safeRegisterMutator(PLAY_MULTI_MUTATOR, playMultiMutator);
  safeRegisterMutator(NEXT_CONNECTION_MUTATOR, nextConnectionMutator);

  // Needed for TypeScript to recognize the type of the MUSIC_BLOCKS. Remove
  // after converting musicBlocks to TypeScript.
  const typedMusicBlocks = MUSIC_BLOCKS as {[key: string]: MusicBlockConfig};
  for (const blockType of Object.keys(typedMusicBlocks)) {
    const blockConfig = typedMusicBlocks[blockType] as MusicBlockConfig;
    Blockly.Blocks[blockType] = {
      init: function () {
        this.jsonInit(blockConfig.definition);
      },
    };

    Blockly.getGenerator().forBlock[blockType] = blockConfig.generator;
  }

  Blockly.JavaScript.addReservedWords(
    ['Sequencer', 'when_run', ...Triggers.map(trigger => trigger.id)].join(',')
  );

  Blockly.fieldRegistry.register(FIELD_SOUNDS_TYPE, FieldSounds);
  Blockly.fieldRegistry.register(FIELD_PATTERN_TYPE, FieldPattern);
  Blockly.fieldRegistry.register(FIELD_PATTERN_AI_TYPE, FieldPatternAi);
  Blockly.fieldRegistry.register(FIELD_CHORD_TYPE, FieldChord);
  Blockly.fieldRegistry.register(FIELD_TUNE_TYPE, FieldTune);

  // Rename the new function placeholder text for Music Lab specifically.
  Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE'] =
    musicI18n.blockly_functionNamePlaceholder();
}

// Register an extension after checking if it is already registered.
function safeRegisterExtension(name: string, initFn: () => void) {
  if (Blockly.Extensions.isRegistered(name)) {
    Blockly.Extensions.unregister(name);
  }
  Blockly.Extensions.register(name, initFn);
}

// Mixin objects use an any type in Blockly core
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeRegisterMutator(name: string, mixinObj: any) {
  if (Blockly.Extensions.isRegistered(name)) {
    Blockly.Extensions.unregister(name);
  }
  Blockly.Extensions.registerMutator(name, mixinObj);
}
