import lab2InstructionsJson from '../public/lab2-instructions.json';

import {INSTRUCTIONS_KEYS, type InstructionsKey} from './types';

export interface Lab2Instructions {
  key: InstructionsKey;
  // A screen name, such as "Dataset".
  name: string;
  defaultText: string;
}

function isInstructionsKey(key: string): key is InstructionsKey {
  return (INSTRUCTIONS_KEYS as readonly string[]).includes(key);
}

// The screens Lab 2 AI Lab shows instructions for, in the order students reach them.
export const LAB2_INSTRUCTIONS: Lab2Instructions[] = lab2InstructionsJson.map(
  ({key, name, defaultText}) => {
    if (!isInstructionsKey(key)) {
      throw new Error(`lab2-instructions.json: unknown key ${key}`);
    }
    return {key, name, defaultText};
  },
);
