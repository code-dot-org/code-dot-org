// Using MIDI note values for notes.
// Note values range [0-127], starting at C-1 (octave -1).

// Used to calculate the specific project root note from the
// project key. When calculating transposed notes, the note
// offset is expressed as the number of semitones above the
// project root note, starting at the octave of middle C
// (MIDI note 60, or C4).
//
// For example, in the key of C (enum value 0), the root note
// is 60 (0 + 60), or C4. In the key of F (enum value 6), the
// root note is 64 (4 + 60), or F4.
const ROOT_NOTE_START = 60;

// Music Key values. Range from 0-11.
export enum Key {
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
}

export const isBlackKey = (note: number): boolean => {
  return [Key['C#'], Key['D#'], Key['F#'], Key['G#'], Key['A#']].includes(
    note % 12
  );
};

export const getNoteName = (note: number): string => Key[note % 12];

// Transpose the note by adding the note offset to the target note defined
// by the target key.
export const getTranposedNote = (targetKey: Key, noteOffset: number) =>
  targetKey + ROOT_NOTE_START + noteOffset;
