// Using MIDI note values for notes.
// Note values range [0-127], starting at C-1 (octave -1).

export const isBlackKey = (note: number): boolean => {
  return [1, 3, 6, 8, 10].includes(note % 12);
};

export const getNoteName = (note: number): string => {
  const noteNames = [
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
    'B'
  ];
  return noteNames[note % 12]; // + (Math.floor(note / 12) - 1);
};
