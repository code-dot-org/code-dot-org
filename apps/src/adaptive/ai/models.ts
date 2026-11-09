// The Gemini models the adaptive shell asks, as two tiers rather than one
// per call, so the whole set can be swapped at once.

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

export const ADAPTIVE_MODELS = {
  /** The project build and the AI Tutor, where the answer is the work. */
  STANDARD: AiChatModelIds.GEMINI_3_5_FLASH_LITE,
  /** Instructions, the validation judge and the safety judge. */
  FAST: AiChatModelIds.GEMINI_3_1_FLASH_LITE,
} as const;
