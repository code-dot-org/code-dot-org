import {
  InstrumentTickEvent,
  ScaleMode,
} from '../player/interfaces/InstrumentEvent';
import MusicLibrary from '../player/MusicLibrary';

import {getNoteName, getNotesInKey, Key, isBlackKey} from './Notes';

export const START_OCTAVE = 4;
export const DISPLAY_OCTAVES = 3;

export type EditorType = 'drums' | 'notes';

export const integers = (length: number, start: number = 0) =>
  Array.from({length}, (_, i) => i + start);

export const isNoteAvailableInScaleMode = (
  key: number,
  note: number,
  scaleMode?: ScaleMode
) =>
  scaleMode === 'simple'
    ? getNotesInKey(key, START_OCTAVE, DISPLAY_OCTAVES).includes(note)
    : true;

// A single event from a tune to be rendered in a graph.
export interface TuneGraphEvent {
  note: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GenerateGraphDataFromTuneOptions {
  notes: InstrumentTickEvent[];
  width: number;
  height: number;
  numOctaves: number;
  startOctave: number;
  padding: number;
  noteHeightScale: number;
}

// Given a ChordEventValue, generate a set of data for graphing it.
export function generateGraphDataFromTune({
  notes,
  width,
  height,
  numOctaves,
  startOctave,
  padding,
  noteHeightScale,
}: GenerateGraphDataFromTuneOptions): TuneGraphEvent[] {
  // Note widths fit in the space; note heights are exaggerated.
  const noteWidth = Math.ceil((width - 2 * padding) / 16);
  const noteHeight = Math.ceil(
    ((height - 2 * padding) / (12 * numOctaves)) * noteHeightScale
  );

  // Blocks' locations will be for their upper-left corners, so ensure
  // that the space we are filling counts for the full size of the blocks.
  const useWidth = width - 2 * padding - noteWidth;
  const useHeight = height - 2 * padding - noteHeight;

  return notes.map(note => {
    return {
      note: note.note,
      x: 1 + ((note.tick - 1) * useWidth) / (16 - 1) + padding,
      y:
        1 +
        padding +
        useHeight -
        ((note.note - startOctave * 12) * useHeight) / (numOctaves * 12 - 1),
      width: noteWidth,
      height: noteHeight,
    };
  });
}

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
      kitFolder?.sounds.map((sound, i) => ({
        name: sound.name,
        note: i,
      })) || []
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

const noteColorsSimple = [
  '#ee0916',
  '#ff7b00',
  '#ff0',
  '#0f0',
  '#0ff',
  '#1a9cff',
  '#c88eee',
];

const noteColorsSimpleKeys = [
  '#bb0710',
  '#bd5b00',
  '#7a7a00',
  '#008a00',
  '#008080',
  '#0076d1',
  '#9930df',
];

export function getNoteColorInfo(scaleMode: ScaleMode, noteValue: number) {
  if (scaleMode === 'simple') {
    return {
      textColor: 'white',
      keyColor: noteColorsSimpleKeys[noteValue % noteColorsSimpleKeys.length],
      selectedColor: noteColorsSimple[noteValue % noteColorsSimple.length],
    };
  } else {
    return {
      textColor: isBlackKey(noteValue) ? 'white' : 'black',
      keyColor: isBlackKey(noteValue) ? 'black' : 'white',
      selectedColor: '#3cfff7',
    };
  }
}
