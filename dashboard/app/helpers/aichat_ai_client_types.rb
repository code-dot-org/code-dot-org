require 'set'

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

  # type JsonPrimitiveType = 'string' | 'number' | 'boolean' | 'null';
  JsonPrimitiveType = string("string") | string("number") | string("boolean") | string("null")

  # interface JsonStringSchema {
  #   type: 'string';
  #   description?: string;
  #   enum?: string[];
  # }
  JsonStringSchema = Interface(
    :type, string("string"),
    :description, Optional(string),
    :enum, Optional(string[])
  )

  # interface JsonNumberSchema {
  #   type: 'number';
  #   description?: string;
  #   enum?: number[];
  # }
  JsonNumberSchema = Interface(
    :type, string("number"),
    :description, Optional(string),
    :enum, Optional(number[])
  )

  # interface JsonBooleanSchema {
  #   type: 'boolean';
  #   description?: string;
  # }
  JsonBooleanSchema = Interface(
    :type, string("boolean"),
    :description, Optional(string)
  )

  # interface JsonNullSchema {
  #   type: 'null';
  #   description?: string;
  # }
  JsonNullSchema = Interface(
    :type, string("null"),
    :description, Optional(string)
  )

  # type JsonPrimitiveSchema = JsonStringSchema | JsonNumberSchema | JsonBooleanSchema | JsonNullSchema;
  JsonPrimitiveSchema = JsonStringSchema | JsonNumberSchema | JsonBooleanSchema | JsonNullSchema

  JsonProperties_ = ForwardRef()

  # interface JsonObjectSchema {
  #   type: 'object';
  #   properties: JsonProperties;
  #   // The required array is optional in JsonSchema but required w/ OpenAI.
  #   // OpenAI also requires that all properties are required which  we don't
  #   // have a way to check w/ RubyTypes so an additional check is required.
  #   required: string[];
  #   description?: string;
  #   additionalProperties: boolean;
  # }
  JsonObjectSchema = Interface(
    :type, string('object'),
    :properties, JsonProperties_,
    :required, string[],
    :description, Optional(string),
    :additionalProperties, boolean(false),
  )

  JsonArraySchema_ = ForwardRef()

  # interface JsonArraySchema {
  #   type: 'array';
  #   items: JsonPrimitiveSchema | JsonArraySchema | JsonObjectSchema;
  #   description?: string;
  # }
  JsonArraySchema = Interface(
    ForwardRef(JsonArraySchema_),
    :type, string('array'),
    :items, JsonPrimitiveSchema | JsonObjectSchema | JsonArraySchema_,
    :description, Optional(string)
  )

  # interface JsonProperties {
  #   [key: string]: JsonPrimitiveSchema | JsonArraySchema | JsonObjectSchema;
  # }
  JsonProperties = Interface(
    ForwardRef(JsonProperties_),
    key[string],  JsonPrimitiveSchema | JsonArraySchema | JsonObjectSchema
  )

  # // While JsonSchema allows primitives and arrays at the top level, OpenAI's
  # // implementation is limited to objects at the top level.
  # type JsonSchema = JsonObjectSchema
  JsonSchema = JsonObjectSchema

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

  # Recursivley validate a hash/struct to ensure that each JsonObjectSchema lists all its
  # properties in the required array (i.e. can't have optional properties). This is
  # currently a requirement for OpenAI.
  def self.validate_json_schema(obj, visited = Set.new)
    # Avoid infinite recursion with a visited set.
    return if visited.include?(obj.object_id)
    visited.add(obj.object_id)

    if obj.is_a?(JsonObjectSchema)
      property_names = obj[:properties].to_h.keys.map(&:to_s)
      property_names.each do |property_name|
        unless obj[:required]&.include?(property_name)
          raise StandardError.new("JsonObjectSchema's 'required' array must include all properties but is missing '#{property_name}'")
        end
      end
    end

    # Recursively process Array elements.
    if obj.is_a?(Array)
      obj.each do |item|
        validate_json_schema(item, visited)
      end

    # Recursively process anything with a each_value (Structs, OpenStructs, and Hashes).
    elsif obj.respond_to?(:each_value)
      obj.each_value do |value|
        validate_json_schema(value, visited)
      end
    end
  end

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
  #   temperature: number;

  #   // Client type.
  #   clientType: number

  #   // Configure the response. Optional, defaults to TextResponse.
  #   response?: TextResponseConfig | JsonResponseConfig
  #

  # }
  AiConfig = Interface(
    :model, string,
    :systemInstructions, Optional(MessagePart[]),
    :temperature, number,
    :clientType, number,
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
