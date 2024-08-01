import {TuneEventValue, TuneTickEvent} from '../player/interfaces/TuneEvent';

// This file contains a helper function for tunes, and is used by the
// block's custom field.

// A single event from a tune to be rendered in a graph.
export interface TuneGraphEvent {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GenerateGraphDataFromTuneOptions {
  tuneEventValue: TuneEventValue;
  width: number;
  height: number;
  numOctaves: number;
  startOctave: number;
  padding: number;
  noteHeightScale: number;
}

// Given a ChordEventValue, generate a set of data for graphing it.
export function generateGraphDataFromTune({
  tuneEventValue,
  width,
  height,
  numOctaves,
  startOctave,
  padding,
  noteHeightScale,
}: GenerateGraphDataFromTuneOptions): TuneGraphEvent[] {
  const notes: TuneTickEvent[] = tuneEventValue.events;

  // Note widths fit in the space; note heights are exaggerated.
  const noteWidth = Math.ceil((width - 2 * padding) / 16);
  const noteHeight = Math.ceil(
    ((height - 2 * padding) / (12 * numOctaves)) * noteHeightScale
  );

  // Blocks' locations will be for their upper-left corners, so ensure
  // that the space we are filling counts for the full size of the blocks.
  const useWidth = width - 2 * padding - noteWidth;
  const useHeight = height - 2 * padding - noteHeight;

  return notes.map((note: TuneTickEvent) => {
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
