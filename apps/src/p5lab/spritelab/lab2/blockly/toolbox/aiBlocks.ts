import {withoutBlockTypes} from '../../blockCatalog';
import {ASK_AI_BLOCK_TYPE} from '../blockDefinitions/askAi';
import {ASK_AI_WITH_CHOICES_BLOCK_TYPE} from '../blockDefinitions/askAiWithChoices';
import {SET_SYSTEM_PROMPT_BLOCK_TYPE} from '../blockDefinitions/setSystemPrompt';

import {ToolboxInfo, withoutCategory} from './types';

export const AI_CATEGORY = 'AI';

export const AI_BLOCK_TYPES = [
  ASK_AI_BLOCK_TYPE,
  ASK_AI_WITH_CHOICES_BLOCK_TYPE,
  SET_SYSTEM_PROMPT_BLOCK_TYPE,
];

const AI_BLOCK_TYPE_SET: ReadonlySet<string> = new Set(AI_BLOCK_TYPES);

// The AI category goes whole, prompt-answered block and all, so it does not
// linger with only that block in it.
export function withoutAiBlocks(toolbox: ToolboxInfo): ToolboxInfo {
  return withoutBlockTypes(
    withoutCategory(toolbox, AI_CATEGORY),
    AI_BLOCK_TYPE_SET
  );
}
