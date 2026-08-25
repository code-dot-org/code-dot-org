import {type FilePart, type ModelMessage, type TextPart} from 'ai';

import {ChatAsset, ChatMessage, ModelParameters} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {assetToFilePart} from './fileHelpers';

interface FormatChatMessageOptions {
  /**
   * Skip assets that cannot be read instead of failing the whole request.
   *
   * Set this for stored history: one unreadable asset in an old message must
   * not block every later message in the conversation. Leave it unset for the
   * message the user just sent, where an unreadable attachment is worth
   * surfacing so they can retry.
   */
  dropUnreadableAssets?: boolean;
}

/**
 * Converts a {@link ChatMessage} to an AI SDK-specific {@link ModelMessage}.
 * Handles downloading project/level assets, if any.
 *
 * Returns undefined when the message has nothing left to send -- an
 * image-only message whose asset could not be read, say. The model rejects a
 * message with no parts ("must include at least one parts field"), so such a
 * message has to be left out of the request rather than sent empty.
 */
export async function formatChatMessage(
  inputMessage: ChatMessage,
  buildAssetUrl: (asset: ChatAsset) => string,
  {dropUnreadableAssets = false}: FormatChatMessageOptions = {}
): Promise<ModelMessage | undefined> {
  const content: Array<TextPart | FilePart> = [];

  // An image-only response has no text. An empty text part is not content, so
  // do not add one: it would make an otherwise empty message look non-empty.
  if (inputMessage.chatMessageText?.trim()) {
    content.push({type: 'text', text: inputMessage.chatMessageText});
  }

  for (const asset of inputMessage.assets || []) {
    try {
      content.push(await assetToFilePart(asset, buildAssetUrl));
    } catch (error) {
      if (!dropUnreadableAssets) {
        throw error;
      }
      // Log and continue so the rest of the conversation still reaches the
      // model. buildAssetUrl can also throw here, when neither a channel nor
      // a level name is available to resolve the asset against.
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Skipping unreadable chat history asset', error as Error, {
          filename: asset.filename,
          source: asset.source,
        });
    }
  }
  if (content.length === 0) {
    return undefined;
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
