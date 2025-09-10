# This module defines and documents the `config`, `request`, and `context` data structures
# that provide a unified model/provider agnostic (currently Gemini + OpenAI) API for our AI
# backend.  This module uses a bespoke DSL (domain specific language) that I'm simply calling
# RubyTypes.  This DSL was designed to mimic defining TypeScript types in a way that will
# raise a runtime error when using a type incorrectly.  Each RubyType definition is preceded
# by the TypeScript definition that it is meant to emulate.
module AichatAiClientTypes
  extend AichatRubyTypes

  # type TextMessagePartType = "text";
  # type FileMessagePartType = "file";
  # type MessagePartType = TextMessagePartType | FileMessagePartType;
  TextMessagePartType = string("text")
  FileMessagePartType = string("file")
  MessagePartType = TextMessagePartType | FileMessagePartType

  # type FileMessageImageMimeType = "image/jpeg" | "image/png";
  # type FileMessagePdfMimeType =  "application/pdf";
  # type FileMessageMimeType = FileMessageImageMimeType | FileMessagePdfMimeType;
  FileMessageImageMimeType = string("image/jpeg") | string("image/png")
  FileMessagePdfMimeType =  string("application/pdf")
  FileMessageMimeType = FileMessageImageMimeType | FileMessagePdfMimeType

  # type MessageRole = "model" | "user";
  MessageRole = string("model") | string("user")

  # type TextMessagePartContent = string;
  TextMessagePartContent = string

  # interface FileMessagePartContent {
  #   name: string;
  #   mimeType: FileMessageMimeType;
  #   data: string; //base64 encoded string
  # }
  FileMessagePartContent = Interface(
    :name, string,
    :mimeType, FileMessageMimeType,
    :data, string
  )

  # interface TextMessagePart {
  #   type: TextMessagePartType;
  #   content: TextMessagePartContent;
  # }
  TextMessagePart = Interface(
    :type, TextMessagePartType,
    :content,  TextMessagePartContent
  )

  # interface FileMessagePart {
  #   type: FileMessagePartType;
  #   content: FileMessagePartContent;
  # }
  FileMessagePart = Interface(
    :type, FileMessagePartType,
    :content, FileMessagePartContent
  )

  # type MessagePart = TextMessagePart | FileMessagePart;
  MessagePart = TextMessagePart | FileMessagePart

  # interface Message {
  #   role: MessageRole;
  #   parts: MessagePart[];
  # }
  Message = Interface(
    :role, MessageRole,
    :parts, MessagePart[]
  )

  # // Config object (required):
  # // Sets up which model to call, the temperature, and any system instructions
  # // to configure the model's response.

  # interface AiConfig {
  #     // Actual model passed to 3rd party AI API (e.g. 'gpt-4o-mini-2024-07-18').
  #     model: string;

  #     // System instructions (made up of message parts).
  #     // When coming from OpenAI's format, it should be noted that there is no need
  #     // for the 'role' concept here since all request messages come from the user.
  #     systemInstructions?: MessagePart[];

  #     // Actual temperature passed to 3rd party AI API (e.g. 1.6)
  #     temperature: number;
  #
  #.    // Client type
  #.    clientType: number
  # }
  AiConfig = Interface(
    :model, string,
    :systemInstructions, Optional(MessagePart[]),
    :temperature, number,
    :clientType, number
  )

  # // Request array (required):
  # // The actual (current) request to send to the model, made up of message parts.
  # // When coming from OpenAI's format, it should be noted that there is no need
  # // for the 'role' concept here since all request messages come from the user.

  # type AiRequest = MessagePart[];
  AiRequest = MessagePart[]

  # // Context array (optional):
  # // The previous (history) messages sent to and from the model.
  # // Each message has a role (user/model) to indicate the direction
  # // and each message has an array of message parts.

  # type AiContext = Message[];
  AiContext = Message[]
end
