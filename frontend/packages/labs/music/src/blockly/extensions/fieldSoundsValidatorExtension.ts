import type {Extension} from '@code-dot-org/blockly-workspace';
import {defineExtension} from '@code-dot-org/blockly-workspace';

import MusicLibrary from '../../player/MusicLibrary';

import {FIELD_SOUNDS_VALIDATOR, FIELD_SOUNDS_NAME} from '../constants';

/**
 * Ensures that sound blocks also have a valid value, even if a level's library or song
 * pack has changed.
 */
export const fieldSoundsValidatorExtension: Extension = defineExtension(
  FIELD_SOUNDS_VALIDATOR,
  {
    extension() {
      // newValue - The sound id selected from the field editor or initial sources.
      this.getField(FIELD_SOUNDS_NAME)?.setValidator((newValue: string) => {
        const libraryInstance = MusicLibrary.getInstance();
        if (libraryInstance) {
          const soundDataForValue = libraryInstance.getSoundForId(newValue);
          const defaultSoundData = libraryInstance.getDefaultSound();
          if (!soundDataForValue) {
            console.warn(
              `A sound field value was reset. ${newValue} was not found in the current library.`,
            );
            return defaultSoundData;
          } else if (!libraryInstance.isSoundIdAvailable(newValue)) {
            console.warn(
              `A sound field value was reset. ${newValue} was not found in the available sound packs.`,
            );
            return defaultSoundData;
          }
        }
        return newValue;
      });
    },
  },
);
