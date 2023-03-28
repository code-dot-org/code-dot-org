import {ChordEventValue} from '../player/interfaces/ChordEvent';

export interface ChordNote {
  tick: number;
  note: number;
}

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

// Helpers for chords, used by the custom field, custom field editor panel,
// and the music player.

// Given a ChordEventValue, generate a set of notes.
export function generateNotesFromChord(
  chordEventValue: ChordEventValue
): ChordNote[] {
  const {instrument, notes, playStyle} = chordEventValue;
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

  if (playStyle === 'together') {
    return notes.map(note => {
      return {
        tick: 1,
        note
      } as ChordNote;
    });
  } else {
    return arrayOfTicks.map(tick => {
      return {
        tick: tick,
        note: notes[(tick - 1) % notes.length]
      };
    });
  }
}

/*
generateGraphFromChord() {

}
*/
