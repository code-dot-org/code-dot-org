import {
  InstrumentTickEvent,
  ScaleMode,
} from '../player/interfaces/InstrumentEvent';

import {getNotesInKey} from './Notes';

export const START_OCTAVE = 4;
export const DISPLAY_OCTAVES = 3;

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
