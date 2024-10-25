import {ConditionNames} from './MusicValidator';

export const MusicConditions: ConditionNames = {
  PLAYED_SOUNDS_TOGETHER: {
    name: 'played_sounds_together',
    valueType: 'number',
    description:
      'Checks if at least this many sounds are playing simultaneously. Ex. Value: 2',
  },
  PLAYED_DIFFERENT_SOUNDS_TOGETHER: {
    name: 'played_different_sounds_together',
    valueType: 'number',
    description:
      'Checks if at least this many unique sounds are playing simultaneously. Ex. Value: 2',
  },
  PLAYED_SOUND_TRIGGERED: {
    name: 'played_sound_triggered',
    description: 'Checks if a triggered sound is playing. Simple2 only.',
  },
  PLAYED_SOUND_TRIGGERED_MULTIPLE_TIMES: {
    name: 'played_sound_triggered_multiple_times',
    valueType: 'number',
    description:
      'Checks if at least this many triggered sounds have played. Simple2 only. Ex. Value: 5',
  },
  PLAYED_SOUND_IN_FUNCTION: {
    name: 'played_sound_in_function',
    valueType: 'string',
    description:
      'Checks if a sound is playing in a given function. Simple2 only. Ex. Value: chorus',
  },
  PLAYED_SOUND_IN_ANY_FUNCTION: {
    name: 'played_sound_in_any_function',
    description: 'Checks if a sound is playing in any function. Simple2 only.',
  },
  PLAYED_ANYTHING_IN_CONDITIONAL: {
    name: 'played_anything_in_conditional',
    description:
      'Checks if something is playing from within an if/else block. Advanced mode only.',
  },
  PLAYED_ANYTHING_IN_FUNCTION: {
    name: 'played_anything_in_function',
    valueType: 'number',
    description:
      'Checks if something is playing from within a function definition block, at least this many times. Ex. Value: 3',
  },
  PLAYED_ANYTHING_IN_LOOP: {
    name: 'played_anything_in_loop',
    valueType: 'number',
    description:
      'Checks if something is playing from within a repeat block, at least this many times. Ex. Value: 3',
  },
  PLAYED_SOUNDS: {
    name: 'played_sounds',
    valueType: 'number',
    description:
      'Checks if at least this many sounds have played. Ex. Value: 2',
  },
  PLAYED_DIFFERENT_SOUNDS: {
    name: 'played_different_sounds',
    valueType: 'number',
    description:
      'Checks if at least this many unique sounds have played. Ex. Value: 2',
  },
  PLAYED_SOUND_ID: {
    name: 'played_sound_id',
    valueType: 'string',
    description:
      'Checks if a specific sound is playing. Ex. Value: beats/drum_kit_disco',
  },
  PLAYED_EMPTY_CHORDS: {
    name: 'played_empty_chords',
    valueType: 'number',
    description:
      'Checks if at least this many empty chords (`play notes` block with no notes) have played.' +
      ' Useful for prompting the student to add notes. Ex. Value: 1',
  },
  PLAYED_CHORDS: {
    name: 'played_chords',
    valueType: 'number',
    description:
      'Checks if at least this many chords (`play notes` block with at least 1 note) have played. Ex. Value: 2',
  },
  PLAYED_EMPTY_PATTERNS: {
    name: 'played_empty_patterns',
    valueType: 'number',
    description:
      'Checks if at least this many empty patterns (`play drums` block with no ticks) have played.' +
      ' Useful for prompting the student to add their own beat. Ex. Value: 1',
  },
  PLAYED_PATTERNS: {
    name: 'played_patterns',
    valueType: 'number',
    description:
      'Checks if at least this many patterns (`play drums` block with at least 1 tick) have played. Ex. Value: 2',
  },
  PLAYED_EMPTY_PATTERNS_AI: {
    name: 'played_empty_patterns_ai',
    valueType: 'number',
    description:
      'Checks if at least this many empty AI patterns (`play AI drums` block with no ticks) have played.' +
      ' Useful for prompting the student to generate a new beat. Ex. Value: 1',
  },
  PLAYED_PATTERNS_AI: {
    name: 'played_patterns_ai',
    valueType: 'number',
    description:
      'Checks if at least this many AI patterns (`play AI drums` block with at least 1 tick) have played. Ex. Value: 2',
  },
  PLAYED_GENERATED_PATTERNS_AI: {
    name: 'played_generated_patterns_ai',
    valueType: 'number',
    description:
      'Checks if at least this many AI patterns with generated notes (`play AI drums` block with at least 1 tick after the first two beats) have played. Ex. Value: 2',
  },
  PLAYED_DIFFERENT_SOUNDS_TOGETHER_MULTIPLE_TIMES: {
    name: 'played_different_sounds_together_multiple_times',
    valueType: 'number',
    description:
      'Checks if at least 2 sounds have played together at least this many times. Ex. Value: 2',
  },
  TRIGGER_ID_PRESSED: {
    name: 'trigger_id_pressed',
    valueType: 'number',
    description:
      'Checks if a given trigger button (1, 2, 3, 4) is pressed. Ex. Value: 1',
  },
};
