import type {ChatConfig, ChatMessage} from './types';

/**
 * Response from OpenAI-compatible chat completions API
 */
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Error response from the API
 */
interface ChatCompletionError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * Send a chat completion request to an OpenAI-compatible endpoint
 */
export async function sendChatCompletion(
  config: ChatConfig,
  messages: ChatMessage[],
): Promise<ChatMessage> {
  try {
    const requestBody: any = {
      model: config.model,
      messages: messages,
      temperature: config.temperature ?? 0.7,
      stream: false, // Always false for non-streaming implementation
    };

    // Only include max_tokens if it's not -1 (unlimited)
    if (config.max_tokens && config.max_tokens !== -1) {
      requestBody.max_tokens = config.max_tokens;
    }

    console.log('Sending request to:', config.url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData: ChatCompletionError = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // If we can't parse the error, use the HTTP status
      }
      throw new Error(errorMessage);
    }

    const data: ChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices returned from API');
    }

    const assistantMessage = data.choices[0].message;

    if (!assistantMessage || !assistantMessage.content) {
      throw new Error('Invalid response format from API');
    }

    return {
      role: 'assistant',
      content: assistantMessage.content,
    };
  } catch (error) {
    // Handle network errors and other exceptions
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to the AI service. Please check if LM Studio is running and accessible.',
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'An unexpected error occurred while communicating with the AI service.',
    );
  }
}
