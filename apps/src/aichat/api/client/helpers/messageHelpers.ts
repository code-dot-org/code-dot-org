import {FilePart, ModelMessage, TextPart} from 'ai';

import {ChatAsset, ChatMessage, ModelParameters} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import {assetToFilePart} from './fileHelpers';

/**
 * Converts a {@link ChatMessage} to an AI SDK-specific {@link ModelMessage}.
 * Handles downloading project/level assets, if any.
 */
export async function formatChatMessage(
  inputMessage: ChatMessage,
  buildAssetUrl: (asset: ChatAsset) => string
): Promise<ModelMessage> {
  const content: Array<TextPart | FilePart> = [
    {type: 'text', text: inputMessage.chatMessageText},
  ];

  for (const asset of inputMessage.assets || []) {
    content.push(await assetToFilePart(asset, buildAssetUrl));
  }
  const role = inputMessage.role === Role.USER ? 'user' : 'assistant';
  return {role, content};
}

/**
 * Converts model parameters and other context into AI SDK-specific system messages.
 */
export function formatSystemMessages(
  modelParameters: ModelParameters,
  hiddenContext?: string,
  levelSystemPrompt?: string
): ModelMessage[] {
  return [
    levelSystemPrompt,
    modelParameters.systemPrompt,
    ...modelParameters.retrievalContexts,
    hiddenContext,
  ]
    .filter(content => content !== undefined)
    .map(content => ({role: 'system', content}));
}
