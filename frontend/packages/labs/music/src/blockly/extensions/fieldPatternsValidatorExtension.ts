import type {Extension} from '@code-dot-org/blockly-workspace';
import {defineExtension} from '@code-dot-org/blockly-workspace';

import {TICKS_PER_MEASURE} from '../../constants';
import MusicLibrary from '../../player/MusicLibrary';
import type {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';

import {
  FIELD_PATTERNS_VALIDATOR,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
} from '../constants';

/**
 * Extension to blocks with pattern fields that validates new values.
 */
export const fieldPatternsValidatorExtension: Extension = defineExtension(
  FIELD_PATTERNS_VALIDATOR,
  {
    extension() {
      // A block may have a pattern field or pattern AI field, but should not have both.
      const patternField =
        this.getField(FIELD_PATTERN_NAME) ||
        this.getField(FIELD_PATTERN_AI_NAME);

      /**
       * Removes invalid event notes from pattern field values.
       * @param newValue The new instrument event value
       * @returns The modified instrument event value
       */
      patternField?.setValidator((newValue: InstrumentEventValue) => {
        const kitNotes = MusicLibrary.getInstance()
          ?.kits.find(kit => kit.id === newValue.instrument)
          ?.sounds.map(sound => sound.note);
        const validatedEvents = newValue.events.filter(
          event =>
            // Remove events with notes that not part of the current kit's sounds. (Ex. 1...8)
            (kitNotes || []).includes(event.note) &&
            // Remove event with ticks that are outside the expected tick range.
            event.tick <= newValue.length * TICKS_PER_MEASURE,
        );
        return {
          ...newValue,
          events: validatedEvents,
        };
      });
    },
  },
);
