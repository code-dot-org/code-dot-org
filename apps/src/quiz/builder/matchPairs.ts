import {createUuid} from '@cdo/apps/utils';

import {MatchPair} from './types';

// MatchQuestion#validate_question_shape rejects fewer than 2 pairs.
export const MIN_PAIRS = 2;

// Random, not sequential: students receive every item's id, and sequential
// ids would give a pair's two items neighboring ids.
export function newMatchPair(firstText = '', secondText = ''): MatchPair {
  return {
    id: createUuid(),
    items: [
      {id: createUuid(), text: firstText},
      {id: createUuid(), text: secondText},
    ],
  };
}
