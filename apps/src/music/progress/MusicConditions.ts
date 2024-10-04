import {ConditionNames} from './MusicValidator';

export const MusicConditions: ConditionNames = {
  PLAYED_SOUNDS_TOGETHER: {
    name: 'played_sounds_together',
    valueType: 'number',
    description:
      'Successful when a minimum number of sounds were playing simultaneously. Ex. Value: 2',
  },
  PLAYED_DIFFERENT_SOUNDS_TOGETHER: {
    name: 'played_different_sounds_together',
    valueType: 'number',
    description:
      'Successful when a minimum number of unique sounds were playing simultaneously. Ex. Value: 2',
  },
  PLAYED_SOUND_TRIGGERED: {
    name: 'played_sound_triggered',
    description:
      'Successful when a triggered playback event begins once. Simple2 only.',
  },
  PLAYED_SOUND_TRIGGERED_MULTIPLE_TIMES: {
    name: 'played_sound_triggered_multiple_times',
    description:
      'Successful when a triggered playback event begins a given number of times. Simple2 only. Ex. Value: 5',
  },
  PLAYED_SOUND_IN_FUNCTION: {
    name: 'played_sound_in_function',
    valueType: 'string',
    description:
      'Successful when a sound is played from a given function. Simple2 only. Ex. Value: chorus',
  },
  PLAYED_SOUNDS: {
    name: 'played_sounds',
    valueType: 'number',
    description:
      'Successful when a minimum number of sounds have played. Ex. Value: 2',
  },
  PLAYED_DIFFERENT_SOUNDS: {
    name: 'played_different_sounds',
    valueType: 'number',
    description:
      'Successful when a minimum number of unique sounds have played. Ex. Value: 2',
  },
  PLAYED_SOUND_ID: {
    name: 'played_sound_id',
    valueType: 'string',
    description:
      'Successful when a specific sound has been played. Ex. Value: beats/drum_kit_disco',
  },
  PLAYED_EMPTY_CHORDS: {
    name: 'played_empty_chords',
    valueType: 'number',
    description:
      'Successful when a minimum number of empty chords (`play notes` block with no notes) have been played.' +
      ' Useful for prompting the student to add notes. Ex. Value: 1',
  },
  PLAYED_CHORDS: {
    name: 'played_chords',
    valueType: 'number',
    description:
      'Successful when a minimum number of chords (`play notes` block with at least 1 note) have played. Ex. Value: 2',
  },
  PLAYED_EMPTY_PATTERNS: {
    name: 'played_empty_patterns',
    valueType: 'number',
    description:
      'Successful when a minimum number of empty patterns (`play drums` block with no ticks) have been played.' +
      ' Useful for prompting the student to add their own beat. Ex. Value: 1',
  },
  PLAYED_PATTERNS: {
    name: 'played_patterns',
    valueType: 'number',
    description:
      'Successful when a minimum number of patterns (`play drums` block with at least 1 tick) have played. Ex. Value: 2',
  },
  PLAYED_EMPTY_PATTERNS_AI: {
    name: 'played_empty_patterns_ai',
    valueType: 'number',
    description:
      'Successful when a minimum number of empty AI patterns (`play AI drums` block with no ticks) have been played.' +
      ' Useful for prompting the student to generate a new beat. Ex. Value: 1',
  },
  PLAYED_PATTERNS_AI: {
    name: 'played_patterns_ai',
    valueType: 'number',
    description:
      'Successful when a minimum number of AI patterns (`play AI drums` block with at least 1 tick) have played. Ex. Value: 2',
  },
  PLAYED_DIFFERENT_SOUNDS_TOGETHER_MULTIPLE_TIMES: {
    name: 'played_different_sounds_together_multiple_times',
    valueType: 'number',
    description:
      'Successful when at least 2 sounds have played together at the same time a minum number of times. Ex. Value: 2',
  },
  TRIGGER_ID_PRESSED: {
    name: 'trigger_id_pressed',
    valueType: 'number',
    description:
      'Successful when a given trigger button (1, 2, 3, 4) has been pressed. Ex. Value: 1',
  },
};
