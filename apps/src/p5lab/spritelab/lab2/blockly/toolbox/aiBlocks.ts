import {blockTypesIn, withoutBlockTypes} from '../../blockCatalog';
import {ASK_AI_BLOCK_TYPE} from '../blockDefinitions/askAi';
import {ASK_AI_WITH_CHOICES_BLOCK_TYPE} from '../blockDefinitions/askAiWithChoices';
import {SET_SYSTEM_PROMPT_BLOCK_TYPE} from '../blockDefinitions/setSystemPrompt';

import {findCategory, ToolboxInfo, withoutCategory} from './types';

export const AI_CATEGORY = 'AI';

export const AI_BLOCK_TYPES = [
  ASK_AI_BLOCK_TYPE,
  ASK_AI_WITH_CHOICES_BLOCK_TYPE,
  SET_SYSTEM_PROMPT_BLOCK_TYPE,
];

const AI_BLOCK_TYPE_SET: ReadonlySet<string> = new Set(AI_BLOCK_TYPES);

export function withoutAiBlocks(toolbox: ToolboxInfo): ToolboxInfo {
  const stripped = withoutBlockTypes(toolbox, AI_BLOCK_TYPE_SET);
  The AI category survives stripping because it holds the prompt-answered block
  The AI category survives stripping because it holds the prompt-answered block
  const category = findCategory(stripped.contents, AI_CATEGORY);
  if (!category) {
    return stripped;
  }
  const elsewhere = new Set(
    blockTypesIn(stripped.contents.filter(entry => entry !== category))
  );
  const onlyHere = blockTypesIn(category.contents).some(
    type => !elsewhere.has(type)
  );
  return onlyHere ? stripped : withoutCategory(stripped, AI_CATEGORY);
}
