import {MatchPair} from './types';

// MatchQuestion#validate_question_shape rejects fewer than 2 pairs.
export const MIN_PAIRS = 2;

// Random, not sequential: students see both sets' item ids, and ids issued
// in sequence would show which items are paired. Not crypto.randomUUID,
// which jsdom lacks.
function newMatchId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function newMatchPair(firstText = '', secondText = ''): MatchPair {
  return {
    id: newMatchId(),
    items: [
      {id: newMatchId(), text: firstText},
      {id: newMatchId(), text: secondText},
    ],
  };
}
