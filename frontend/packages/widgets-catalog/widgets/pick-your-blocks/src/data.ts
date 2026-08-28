// owned by this widget - fixed closing scenarios so the synthesis always lands consistently.

export interface ToolOption {
  id: 'sequence' | 'loop' | 'conditional' | 'function';
  label: string;
  icon: string;
}

export const TOOLS: ToolOption[] = [
  {id: 'sequence', label: 'Sequence', icon: '➡️'},
  {id: 'loop', label: 'Loop', icon: '🔁'},
  {id: 'conditional', label: 'Conditional', icon: '❓'},
  {id: 'function', label: 'Function', icon: '🏷️'},
];

export interface ScenarioItem {
  id: string;
  emoji: string;
  text: string;
  answer: ToolOption['id'];
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export const ITEMS: ScenarioItem[] = [
  {
    id: 'sounds_in_order',
    emoji: '🎵',
    text: 'Play three different sounds, one after another, just once.',
    answer: 'sequence',
    feedbackCorrect:
      'Yes! Different steps in order, no repeats and no decisions needed — a plain sequence works perfectly.',
    feedbackIncorrect:
      'Not quite — try a sequence for this one. Different steps in order, no repeats and no decisions needed.',
  },
  {
    id: 'repeat_drum',
    emoji: '🥁',
    text: 'Play the same drum hit 8 times in a row.',
    answer: 'loop',
    feedbackCorrect:
      'Yes! The exact same action many times in a row is exactly what a loop is for.',
    feedbackIncorrect:
      'Not quite — try a loop for this one. The exact same action many times in a row is exactly what a loop is for.',
  },
  {
    id: 'key_sound',
    emoji: '⌨️',
    text: 'Play a sound only if a key is pressed.',
    answer: 'conditional',
    feedbackCorrect:
      'Yes! Something that only happens sometimes, based on a condition, is a job for a conditional.',
    feedbackIncorrect:
      'Not quite — try a conditional for this one. Something that only happens sometimes, based on a condition, needs an if.',
  },
  {
    id: 'reuse_intro',
    emoji: '🏷️',
    text: 'You use the same 4-block intro three times in your song, so you give it a name to reuse it.',
    answer: 'function',
    feedbackCorrect:
      'Yes! Naming a group of blocks so you can reuse it anywhere is exactly what a function is for.',
    feedbackIncorrect:
      'Not quite — try a function for this one. Naming a group of blocks so you can reuse it anywhere saves you from repeating yourself.',
  },
];

export const TAKEAWAY =
  "There's no single best tool — the trick is picking the one that matches the job.";
