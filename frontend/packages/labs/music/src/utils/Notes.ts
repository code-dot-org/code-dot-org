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
export const KeyMapping: Record<number, string> = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B',
} as const;

export const KeyFromName: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
} as const;

export type Key = keyof typeof KeyMapping;

export const isBlackKey = (note: number): boolean => {
  return [
    KeyFromName['C#'],
    KeyFromName['D#'],
    KeyFromName['F#'],
    KeyFromName['G#'],
    KeyFromName['A#'],
  ].includes(note % 12);
};

// Get the note name ('C', 'D', 'E', etc.) from the MIDI note value.
export const getNoteName = (note: number): string => KeyMapping[note % 12];

// Get the note octave from the MIDI note value.
export const getNoteOctave = (note: number): number =>
  Math.floor(note / 12) - 1;

// Get the full pitch name ('C4', 'D5', etc.) from the MIDI note value.
export const getPitchName = (note: number): string =>
  getNoteName(note) + getNoteOctave(note);

// Get the appropriate offset from the root note for a given key, with
// extra handling to pick the closest transposition.
const getTranspositionOffsetForKey = (targetKey: Key) =>
  (targetKey as number) > 6
    ? (targetKey as number) - 12
    : (targetKey as number);

// Convert a pitch from relative to absolute, by adding the note offset
// to the target note defined by the target key.
export const convertRelativeToAbsolutePitch = (
  targetKey: Key,
  noteOffset: number,
) => {
  return getTranspositionOffsetForKey(targetKey) + ROOT_NOTE_START + noteOffset;
};

// Convert a pitch from absolute to relative.
export const convertAbsoluteToRelativePitch = (
  targetKey: Key,
  note: number,
) => {
  return note - ROOT_NOTE_START - getTranspositionOffsetForKey(targetKey);
};

/**
 * Returns diatonic notes in the given key and number of octaves.
 * Keys are always assumed to be major; minor keys are encoded as
 * their relative major keys.
 */
export const getNotesInKey = (
  key: Key,
  startOctave: number,
  numOctaves: number,
) => {
  // Find transposition offset
  const offset = getTranspositionOffsetForKey(key);
  // Major scale intervals
  const intervals = [2, 2, 1, 2, 2, 2, 1];

  let currentNote = startOctave * 12 + offset;
  const notes = [currentNote];
  for (let i = 0; i < intervals.length * numOctaves; i++) {
    notes.push((currentNote += intervals[i % intervals.length]));
  }

  return notes;
};
