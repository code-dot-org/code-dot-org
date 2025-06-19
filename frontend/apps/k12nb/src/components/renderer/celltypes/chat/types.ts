/**
 * Configuration interface for chat cells
 */
export interface ChatConfig {
  /** OpenAI compliant endpoint URL */
  url: string;
  /** Model name to use */
  model: string;
  /** Array of chat messages */
  messages: ChatMessage[];
  /** Temperature for response generation (default: 0.7) */
  temperature?: number;
  /** Maximum tokens to generate (default: -1 for unlimited) */
  max_tokens?: number;
  /** Whether to stream responses (default: false) */
  stream?: boolean;
}

/**
 * Individual chat message
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant';
  /** Content of the message */
  content: string;
}
