import {isStaticCategoryInfo} from '@cdo/apps/blockly/utils/toolbox';

import {withoutBlockTypes} from '../../blockCatalog';
import {ASK_AI_BLOCK_TYPE} from '../blockDefinitions/askAi';
import {ASK_AI_WITH_CHOICES_BLOCK_TYPE} from '../blockDefinitions/askAiWithChoices';
import {SET_SYSTEM_PROMPT_BLOCK_TYPE} from '../blockDefinitions/setSystemPrompt';

import {ToolboxInfo} from './types';

export const AI_CATEGORY = 'AI';

export const AI_BLOCK_TYPES = [
  ASK_AI_BLOCK_TYPE,
  ASK_AI_WITH_CHOICES_BLOCK_TYPE,
  SET_SYSTEM_PROMPT_BLOCK_TYPE,
];

const AI_BLOCK_TYPE_SET: ReadonlySet<string> = new Set(AI_BLOCK_TYPES);

export function withoutAiBlocks(toolbox: ToolboxInfo): ToolboxInfo {
  const stripped = withoutBlockTypes(toolbox, AI_BLOCK_TYPE_SET);
  return {
    ...stripped,
    contents: stripped.contents.filter(
      entry => !isStaticCategoryInfo(entry) || entry.contents.length > 0
    ),
  };
}
