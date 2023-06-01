// Using MIDI note values for notes.
// Note values range [0-127], starting at C-1 (octave -1).

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
  return [1, 3, 6, 8, 10].includes(note % 12);
};

export const getNoteName = (note: number): string => Key[note % 12];

// Transpose the note by calculating the original key offset from the target key.
export const getTranposedNote = (
  targetKey: Key,
  rootKey: number,
  note: number
) => targetKey - rootKey + note;
