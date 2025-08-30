#TODO - try to make optional args
# :arg?: mightNotBeHere

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

  # // type JsonPrimitiveType = 'string' | 'number' | 'boolean' | 'null';
  JsonPrimitiveType = string("string") | string("number") | string("boolean") | string("null")

  # // interface JsonPropertySchema {
  # //   type: JsonPrimitiveType | 'object' | 'array';
  # //   description?: string;
  # //   // Does not include `$ref` to avoid recursion.
  # // }
  JsonPropertySchema = Interface(
    :type, JsonPrimitiveType | string('object') | string('array'),
    :description, Optional(string)
  )

  JsonProperty_ = ForwardRef()

  # // interface JsonObjectSchema {
  # //   type: 'object';
  # //   properties: JsonProperty;
  # //   required?: string[];
  # //   description?: string;
  # // }
  JsonObjectSchema = Interface(
    :type, string('object'),
    :properties, JsonProperty_,
    :required, Optional(string[]),
    :description, Optional(string)
  )

  JsonArraySchema_ = ForwardRef()

  # // interface JsonArraySchema {
  # //   type: 'array';
  # //   items: JsonPropertySchema | JsonArraySchema | JsonObjectSchema;
  # //   description?: string;
  # // }
  JsonArraySchema = Interface(
    ForwardRef(JsonArraySchema_),
    :type, string('array'),
    :items, JsonPropertySchema | JsonObjectSchema | JsonArraySchema_,
    :description, Optional(string)
  )

  # // interface JsonProperty {
  # //   [key: string]: JsonPropertySchema | JsonArraySchema | JsonObjectSchema;
  # // }
  JsonProperty = Interface(
    ForwardRef(JsonProperty_),
    key[string],  JsonPropertySchema | JsonArraySchema | JsonObjectSchema
  )

  # // interface JsonPrimitiveSchema {
  # //   type: JsonPrimitiveType
  # // }
  JsonPrimitiveSchema = Interface(
    :type, JsonPrimitiveType,
    :description, Optional(string)
  )

  # // type JsonSchema =
  # //   JsonPrimitiveSchema
  # //   | JsonObjectSchema
  # //   | JsonArraySchema;
  JsonSchema = JsonPrimitiveSchema | JsonObjectSchema | JsonArraySchema

  # Interface TextResponseConfig {
  #   "mimeType": 'text/plain'
  # }
  TextResponseConfig = Interface(
    :mimeType, string('text/plain')
  )

  # Interface JsonResponseConfigValidation
  #   "type": 'jsonSchema',
  #   "schema": JsonSchema
  # }
  JsonResponseConfigValidation = Interface(
    :type, string('jsonSchema'),
    :schema, JsonSchema
  )

  # Interface JsonResponseConfig {
  #   "mimeType": 'application/json',
  #   "validation": JsonResponseConfigValidation
  # }
  JsonResponseConfig = Interface(
    :mimeType, string('application/json'),
    :validation, JsonResponseConfigValidation
  )

  # // Config object (required):
  # // Sets up which model to call, the temperature, and any system instructions
  # // to configure the model's response.

  # interface AiConfig {
  #   // Actual model passed to 3rd party AI API (e.g. 'gpt-4o-mini-2024-07-18').
  #   model: string;

  #   // System instructions (made up of message parts).
  #   // When coming from OpenAI's format, it should be noted that there is no need
  #   // for the 'role' concept here since all request messages come from the user.
  #   systemInstructions?: MessagePart[];

  #   // Actual temperature passed to 3rd party AI API (e.g. 1.6)
  #     temperature: number;

  #   // Configure the response. Optional, defaults to TextResponse.
  #   response?: TextResponseConfig | JsonResponseConfig
  # }
  AiConfig = Interface(
    :model, string,
    :systemInstructions, Optional(MessagePart[]),
    :temperature, number,
    :response,  Optional(TextResponseConfig | JsonResponseConfig)
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
