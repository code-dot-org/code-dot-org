// Each word set's colour, worn by its words in the carousel and in the
// sentence, so a finished sentence reads as a string of coloured beads.

export type Hue = 'teal' | 'yellow' | 'purple' | 'orange' | 'blue';

const HUES: Record<string, Hue> = {
  creature: 'teal',
  place: 'teal',
  thing: 'orange',
  adjective: 'yellow',
  clothing: 'purple',
  detail: 'blue',
};

export const hueFor = (slotId: string): Hue => HUES[slotId] ?? 'blue';
