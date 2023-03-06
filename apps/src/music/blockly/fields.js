// Common field definitions used across multiple music blocks

import {DEFAULT_SOUND} from '../constants';
import Globals from '../globals';
import {
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE
} from './constants';

export const fieldSoundsDefinition = {
  type: FIELD_SOUNDS_TYPE,
  name: FIELD_SOUNDS_NAME,
  getLibrary: () => Globals.getLibrary(),
  playPreview: (id, onStop) => {
    Globals.getPlayer().previewSound(id, onStop);
  },
  currentValue: DEFAULT_SOUND
};

export const fieldRestDurationDefinition = {
  type: 'field_dropdown',
  name: FIELD_REST_DURATION_NAME,
  options: [
    ['1/2 beat', '0.125'],
    ['1 beat', '0.25'],
    ['2 beats', '0.5'],
    ['1 measure', '1'],
    ['2 measures', '2']
  ]
};
