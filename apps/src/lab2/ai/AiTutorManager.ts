import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage, AichatContext} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getStore} from '@cdo/apps/redux';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

export default class AiTutorManager {
  async askAiTutor(message: string) {
    const state = getStore().getState();

    const newUserMessage: PendingChatMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
      assets: undefined,
      timestamp: Date.now(),
    };

    const aichatContext: AichatContext = {
      currentLevelId: state.progress.currentLevelId || '',
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };

    const aiCustomizations = {
      ...EMPTY_AI_CUSTOMIZATIONS,
      systemPrompt:
        "You are responding to a query about programming.  Target the reading age of an American 7th grader.  Use the Socratic method to guide the student to the answer, but do not give them the answer directly.  Just focus on the biggest single issue you find.  Use plain English in the answer.  I don't want multiple steps, points, or questions.  Just one question that helps the student to make progress.  Feel free to look back at earlier attempts to determine whether the user needs extra hints, especially if they seem to be stuck.  If you notice the same code being tried more than three times in a row, telling the user the actual answer.",
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
