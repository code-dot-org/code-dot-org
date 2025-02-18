import {
  Role,
  AITutorInteractionStatus as Status,
  AITutorInteractionStatusValue,
  ChatCompletionMessage,
} from '@cdo/apps/aiTutor/types';
import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';

// These are the possible statuses returned by ShareFiltering.find_failure
enum ShareFilterStatus {
  Email = 'email',
  Phone = 'phone',
  Address = 'address',
  Profanity = 'profanity',
}

const CHAT_COMPLETION_URL = '/openai/chat_completion';

// Analogous to https://github.com/code-dot-org/ml-playground/pull/299
// We want to expose enough information to help troubleshoot false positives
const logViolationDetails = (response: OpenaiChatCompletionMessage) => {
  console.info('Violation detected in chat completion response', {
    type: response.safety_status,
    content: response.flagged_content,
  });
  MetricsReporter.logWarning({
    event: MetricEvent.AI_TUTOR_CHAT_PROFANITY_PII_VIOLATION,
    content: response.flagged_content,
  });
};

/**
 * This function sends a POST request to the chat completion backend controller.
 */
export async function postOpenaiChatCompletion(
  messagesToSend: OpenaiChatCompletionMessage[],
  levelId?: number,
  scriptId?: number,
  systemPrompt?: string
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = {
    messages: messagesToSend,
    levelId: levelId,
    scriptId: scriptId,
    systemPrompt: systemPrompt,
  };

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error getting chat completion response');
  }
}

const formatForChatCompletion = (
  chatMessages: ChatCompletionMessage[]
): OpenaiChatCompletionMessage[] => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};

/**
 * This function formats chat completion messages including the system prompt, passes them
 * to `postOpenaiChatCompletion`, then returns the status of the response and assistant message if successful.
 */
export async function getChatCompletionMessage(
  formattedQuestion: string,
  chatMessages: ChatCompletionMessage[],
  systemPrompt?: string,
  levelId?: number,
  scriptId?: number
): Promise<ChatCompletionResponse> {
  const messagesToSend = [
    ...formatForChatCompletion(chatMessages),
    {role: Role.USER, content: formattedQuestion},
  ];
  let response;

  try {
    response = await postOpenaiChatCompletion(
      messagesToSend,
      levelId,
      scriptId,
      systemPrompt
    );
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_COMPLETION_FAIL,
      errorMessage:
        (error as Error).message || 'Error in chat completion request',
    });
  }

  if (!response)
    return {
      status: Status.ERROR,
      assistantResponse:
        'There was an error processing your request. Please try again.',
    };

  switch (response.safety_status) {
    case ShareFilterStatus.Profanity:
      logViolationDetails(response);
      return {
        status: Status.PROFANITY_VIOLATION,
        assistantResponse:
          'Please revise your message to remove any profanity so that I can assist you further.',
      };
    case ShareFilterStatus.Email:
    case ShareFilterStatus.Phone:
    case ShareFilterStatus.Address:
      // False positives with the PII filter (e.g. `for loops` flagged as addresses,
      // and curriculum fake emails) were significantly impacting user experience.
      // We're effectively turning PII filtering off for AI Tutor
      // but still logging the violation for future analysis.
      logViolationDetails(response);
      return {status: Status.OK, assistantResponse: response.content};
    default:
      return {status: Status.OK, assistantResponse: response.content};
  }
}

type OpenaiChatCompletionMessage = {
  status?: AITutorInteractionStatusValue;
  role: Role;
  content: string;
  // Only used in case of PII or profanity violation
  flagged_content?: string;
  safety_status?: AITutorInteractionStatusValue;
};

type ChatCompletionResponse = {
  status: AITutorInteractionStatusValue;
  assistantResponse?: string;
};
