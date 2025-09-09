import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage, AichatContext} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  FeedbackData,
  logAiInteractionFeedback,
} from '@cdo/apps/aiEvaluation/aiInteractionFeedbackApi';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {AiChatModelIdType} from './ai-tutor-model-id';

const systemPrompts = {
  hint: "You are responding to a query about programming.  Target the reading age of an American 7th grader.  Use the Socratic method to guide the student to the answer, but do not give them the answer directly.  Just focus on the biggest single issue you find.  Use plain English in the answer.  I don't want multiple steps, points, or questions.  Just one statement (not expressed as a question) that helps the student to make progress.",
};

export type AiTutor2MessageType = 'hint';

export default class AiTutor2Manager {
  private currentLevelId: string | null;
  private scriptId: number | undefined;
  private channelId: string | undefined;
  private modelId: AiChatModelIdType;

  constructor(
    modelId: AiChatModelIdType = AiChatModelIds.GEMINI_2_0_FLASH,
    currentLevelId: string | null,
    scriptId: number | undefined,
    channelId: string | undefined
  ) {
    this.modelId = modelId;
    this.currentLevelId = currentLevelId;
    this.scriptId = scriptId;
    this.channelId = channelId;
  }

  async askAiTutor2(
    message: string,
    hiddenContext: string,
    type: AiTutor2MessageType
  ) {
    const newUserMessage: PendingChatMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
      hiddenContext,
      assets: undefined,
      timestamp: Date.now(),
    };

    const aichatContext: AichatContext = {
      clientType: AiChatClientTypes.AI_TUTOR,
      currentLevelId: this.currentLevelId
        ? parseInt(this.currentLevelId)
        : null,
      scriptId: this.scriptId || null,
      channelId: this.channelId,
    };

    const aiCustomizations = {
      ...EMPTY_AI_CUSTOMIZATIONS,
      selectedModelId: this.modelId,
      systemPrompt: systemPrompts[type],
    };

    const messages = await postAichatCompletionMessage(
      newUserMessage,
      [],
      aiCustomizations,
      aichatContext
    );

    const feedbackData: FeedbackData = {
      aiInteractionType: 'AichatRequest',
      aiInteractionId: messages[0].requestId,
      thumbsUp: undefined,
      levelId: this.currentLevelId ? parseInt(this.currentLevelId) : undefined,
      scriptId: this.scriptId,
      metadata: {
        channelId: this.channelId || '',
        modelId: this.modelId,
        systemPrompt: systemPrompts[type],
        type,
        userMessage: message,
      },
    };

    logAiInteractionFeedback(feedbackData).catch(error => {
      console.error('🤖: Error logging feedback:', error);
    });

    return messages;
  }
}
