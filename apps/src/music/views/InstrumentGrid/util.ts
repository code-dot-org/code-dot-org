import MusicLibrary from '../../player/MusicLibrary';
import {getNoteName, getNotesInKey, Key} from '../../utils/Notes';

import {EditorType, ScaleMode} from '.';

const START_OCTAVE = 4;
const DISPLAY_OCTAVES = 3;

export const integers = (length: number, start: number = 0) =>
  Array.from({length}, (_, i) => i + start);

export function getDisplayNotes(
  editorType: EditorType,
  scaleMode: ScaleMode,
  instrument: string,
  rootKey: Key
) {
  if (editorType === 'drums') {
    const kitFolder = MusicLibrary.getInstance()?.kits.find(
      kit => kit.id === instrument
    );
    return (
      kitFolder?.sounds.map((sound, i) => ({name: sound.name, note: i})) || []
    );
  }
  let noteValues;
  if (scaleMode === 'chromatic') {
    noteValues = integers(DISPLAY_OCTAVES * 12 + 1, START_OCTAVE * 12);
  } else {
    noteValues = getNotesInKey(rootKey, START_OCTAVE, DISPLAY_OCTAVES);
  }

  return noteValues.map(note => ({note, name: getNoteName(note)}));
}

export function getInstruments(editorType: EditorType) {
  if (editorType === 'drums') {
    return MusicLibrary.getInstance()?.kits || [];
  }
  return MusicLibrary.getInstance()?.instruments || [];
}
