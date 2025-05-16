import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage, AichatContext} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

const systemPrompts = {
  hint: "You are responding to a query about programming.  Target the reading age of an American 7th grader.  Use the Socratic method to guide the student to the answer, but do not give them the answer directly.  Just focus on the biggest single issue you find.  Use plain English in the answer.  I don't want multiple steps, points, or questions.  Just one question that helps the student to make progress.",
  user: 'You are responding to a query about programming.  Target the reading age of an American 7th grader.  Use plain English in the answer.  Keep the answer relatively short, say one or two paragraphs, with each paragraph two sentences or less.',
};

export default class AiTutorManager {
  private currentLevelId: string | null;
  private scriptId: number | undefined;
  private channelId: string | undefined;

  constructor(
    currentLevelId: string | null,
    scriptId: number | undefined,
    channelId: string | undefined
  ) {
    this.currentLevelId = currentLevelId;
    this.scriptId = scriptId;
    this.channelId = channelId;
  }

  async askAiTutor(message: string, type: 'hint' | 'user') {
    const newUserMessage: PendingChatMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
      assets: undefined,
      timestamp: Date.now(),
    };

    const aichatContext: AichatContext = {
      currentLevelId: parseInt(this.currentLevelId || '0'),
      scriptId: this.scriptId || null,
      channelId: this.channelId,
    };

    const aiCustomizations = {
      ...EMPTY_AI_CUSTOMIZATIONS,
      selectedModelId: AiChatModelIds.CHATGPT,
      systemPrompt: systemPrompts[type],
    };

    const messages = await postAichatCompletionMessage(
      newUserMessage,
      [],
      aiCustomizations,
      aichatContext
    );

    return messages;
  }
}
