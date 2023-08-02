import {ChordEventValue} from '../player/interfaces/ChordEvent';

// This file contains helper functions for chords, and is used by the
// block's custom field, the custom field editor panel, and the music player.

// A single note to be played in a chord.
export interface ChordNote {
  tick: number;
  note: number;
}

// A single note from a chord to be rendered in a graph.
export interface ChordGraphNote {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

// Given a ChordEventValue, generate a set of notes.
export function generateNotesFromChord(
  chordEventValue: ChordEventValue
): ChordNote[] {
  const playStyle = chordEventValue.playStyle;
  const notes = [...chordEventValue.notes];
  if (notes.length === 0) {
    return [];
  }

  if (playStyle === 'arpeggio-up') {
    notes.sort();
  } else if (playStyle === 'arpeggio-down') {
    notes.sort().reverse();
  } else if (playStyle === 'arpeggio-random') {
    // Randomize using Fisher-Yates Algorithm
    for (let i = notes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = notes[i];
      notes[i] = notes[j];
      notes[j] = temp;
    }
  }

  if (playStyle === 'arpeggio-random') {
    return arrayOfTicks.map(tick => {
      return {
        tick: tick,
        note: notes[Math.floor(Math.random() * notes.length)],
      };
    });
  } else if (playStyle === 'together') {
    return notes.map(note => {
      return {
        tick: 1,
        note,
      };
    });
  } else {
    if (playStyle === 'arpeggio-up') {
      notes.sort();
    } else if (playStyle === 'arpeggio-down') {
      notes.sort().reverse();
    }

    return arrayOfTicks.map(tick => {
      return {
        tick: tick,
        note: notes[(tick - 1) % notes.length],
      };
    });
  }
}

interface GenerateGraphDataFromChordOptions {
  chordEventValue: ChordEventValue;
  width: number;
  height: number;
  numOctaves: number;
  startOctave: number;
  padding: number;
  noteHeightScale: number;
}

// Given a ChordEventValue, generate a set of data for graphing it.
export function generateGraphDataFromChord({
  chordEventValue,
  width,
  height,
  numOctaves,
  startOctave,
  padding,
  noteHeightScale,
}: GenerateGraphDataFromChordOptions): ChordGraphNote[] {
  const notes: ChordNote[] = generateNotesFromChord(chordEventValue);

  // Note widths fit in the space; note heights are exaggerated.
  const noteWidth = Math.ceil((width - 2 * padding) / 16);
  const noteHeight = Math.ceil(
    ((height - 2 * padding) / (12 * numOctaves)) * noteHeightScale
  );

  // Blocks' locations will be for their upper-left corners, so ensure
  // that the space we are filling counts for the full size of the blocks.
  const useWidth = width - 2 * padding - noteWidth;
  const useHeight = height - 2 * padding - noteHeight;

  return notes.map((note: ChordNote) => {
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
