// Where in a checked step's chat the shell stops holding Continue on a
// passing build alone. Reply counts, set in DCDO so they can be tuned
// without a deploy.

import DCDO from '@cdo/apps/dcdo';

export const REPLY_LIMIT_FLAG = 'adaptive-reply-limit';

const DEFAULT_REPLY_LIMIT = 8;

export interface ChatThresholds {
  /** Replies after which Continue opens regardless. */
  replyLimit: number;
}

// DCDO stores arbitrary JSON; anything but a positive whole number falls back.
function countFromDcdo(flag: string, fallback: number): number {
  const number = Number(DCDO.get(flag));
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export function chatThresholds(): ChatThresholds {
  return {
    replyLimit: countFromDcdo(REPLY_LIMIT_FLAG, DEFAULT_REPLY_LIMIT),
  };
}
