import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {AichatContext, PendingChatMessage} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichatLab/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getStore} from '@cdo/apps/redux';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {buildPrompt} from '../blockly/generateContent';

// The project's costume and background names from the animationList slice, so
// the model only references images that actually exist. Exported so the
// generate flow can validate the model's output against the same lists.
export function getAvailableImageNames(): {
  costumes: string[];
  backgrounds: string[];
} {
  const costumes: string[] = [];
  const backgrounds: string[] = [];
  const animationList = getStore().getState().animationList;
  (animationList?.orderedKeys || []).forEach((key: string) => {
    const props = animationList.propsByKey[key];
    if (!props?.name) {
      return;
    }
    if ((props.categories || []).includes('backgrounds')) {
      backgrounds.push(props.name);
    } else {
      costumes.push(props.name);
    }
  });
  return {costumes, backgrounds};
}

// The project's scene names (for go_to_scene). Empty outside the scenes UI
// variant, which keeps the command out of the prompt.
function getSceneNames(): string[] {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  return scenes
    .map((scene: {name?: string}) => scene.name)
    .filter(Boolean) as string[];
}

/**
 * Ask the AI to turn a natural-language request into Sprite Lab pseudocode.
 * Modeled on Music Lab's askAi: FLOW_LAB client type (trusted + longer
 * timeouts) and Gemini 2.5 Flash. Returns the generated pseudocode text.
 */
export default async function askSpriteLabAi(
  userPrompt: string
): Promise<string> {
  const {costumes, backgrounds} = getAvailableImageNames();
  const newUserMessage: PendingChatMessage = {
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: buildPrompt(
      userPrompt,
      costumes,
      backgrounds,
      getSceneNames()
    ),
    assets: undefined,
    timestamp: Date.now(),
  };

  const aichatContext: AichatContext = {
    clientType: AiChatClientTypes.FLOW_LAB,
    currentLevelId: null,
    scriptId: null,
    channelId: undefined,
  };

  const aiCustomizations = {
    ...EMPTY_AI_CUSTOMIZATIONS,
    selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
    systemPrompt: '',
  };

  const messages = await postAichatCompletionMessage(
    newUserMessage,
    [],
    aiCustomizations,
    aichatContext
  );

  // The model's reply is the last non-user message. A moderated request
  // (aichat's student-safety filters) comes back with NO assistant message
  // and the verdict on the user message's status — surface that as an error
  // instead of handing the parser an empty string.
  const reply = [...messages]
    .reverse()
    .find(message => message.role !== Role.USER);
  if (!reply) {
    const userStatus = messages.find(m => m.role === Role.USER)?.status;
    if (userStatus === Status.PROFANITY_VIOLATION) {
      throw new Error(
        'The AI safety filter blocked this request as inappropriate for the ' +
          'classroom. Try rephrasing (even words like "rude" can trip it).'
      );
    }
    if (userStatus === Status.PII_VIOLATION) {
      throw new Error(
        'The AI safety filter blocked this request because it looked like it ' +
          'contained personal information. Try rephrasing.'
      );
    }
    throw new Error("The AI didn't answer. Try again.");
  }
  if (reply.status !== Status.OK) {
    if (reply.status === Status.MODEL_RATE_LIMITED) {
      throw new Error('The AI is busy right now. Try again in a moment.');
    }
    if (reply.status === Status.MODEL_TIMEOUT) {
      throw new Error('The AI took too long to answer. Try again.');
    }
    if (reply.status === Status.PROFANITY_VIOLATION) {
      throw new Error(
        "The AI's answer was blocked by the safety filter. Try rephrasing."
      );
    }
    throw new Error('The AI request failed. Try again.');
  }
  return reply.chatMessageText ?? '';
}
