require 'test_helper'
require 'webmock/minitest'

class AichatAiClientTest < ActionView::TestCase
  setup do
    @stored_messages = [
      {
        role: 'user',
        chatMessageText: 'hello from user',
      }.stringify_keys,
      {
        role: 'assistant',
        chatMessageText: 'assistant response',
      }.stringify_keys
    ]
    @new_message = {role: 'user', chatMessageText: 'new message from user'}.stringify_keys
    @new_message_with_hidden_context = {role: 'user', chatMessageText: 'new message from user', hiddenContext: 'hidden context text'}.stringify_keys
    @new_message_with_assets = {role: 'user',
       chatMessageText: 'message with assets',
       assets: [
         {filename: 'image.png', source: 'project'},
         {filename: 'file.pdf', source: 'level'}
       ]}.deep_stringify_keys

    @temperature = 0.5
    @system_prompt = 'test prompt'
    @retrieval_contexts = ['test retrieval']
    @encrypted_channel_id = 12345
    @user_id = 'test-user'
    @project_id = 'Aichat project'
    @client_type = 0
    @response_text = "some response text"
    @specific_error_message = 'some specific error message'
    @ruby_types_error = 'does not match type'
    @json_schema_required_error = "'required' array must include all properties but is missing"

    @level_with_level_system_prompt = Level.create({name: 'Aichat level', properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
    @level_without_level_system_prompt = Level.create({name: 'Aichat level without level system prompt', properties: {aichat_settings: {}}})

    @json_schema_with_top_level_primitive = {
      type: 'string',
      description: "While a top level primitive (e.g. string) is allowed in JSON/JSON Schema, it is not allowed in OpenAI or Gemini's structured output, so we don't allow it."
    }

    @json_schema_with_top_level_array = {
      type: 'array',
      items: {
        type: 'string',
        description: 'some string value'
      },
      description: "While a top level array is allowed in JSON/JSON Schema and Gemini, it is not allowed in OpenAI's structured output, so we don't allow it."
    }

    @json_schema_with_top_level_object_and_missing_required = {
      type: 'object',
      properties: {
        property1:
          {
            type: 'string',
            description: 'Property 1'
          },
         property2:
          {
            type: 'string',
            description: 'Property 2'
          },
         property3:
          {
            type: 'string',
            description: 'Property 3'
          },
      },
      required: ['property1', 'property2'],
      additionalProperties: false
    }

    @json_schema_with_top_level_object_and_addition_properties_true = {
      type: 'object',
      properties: {
        property1:
          {
            type: 'string',
            description: 'Property 1'
          },
         property2:
          {
            type: 'string',
            description: 'Property 2'
          }
      },
      required: ['property1', 'property2'],
      additionalProperties: true
    }

    @json_schema_with_top_level_object_and_no_addition_properties = {
      type: 'object',
     properties: {
       property1:
         {
           type: 'string',
           description: 'Property 1'
         },
        property2:
         {
           type: 'string',
           description: 'Property 2'
         }
     },
     required: ['property1', 'property2']
    }

    @json_schema_with_top_level_object_and_all_required =  {
      type: 'object',
     properties: {
       property1:
         {
           type: 'string',
           description: 'Property 1',
           enum: ['value', 'otherValue']
         },
       property2:
         {
           type: 'number',
           description: 'Property 2',
           enum: [1, 2, 3, 4, 5]
         },
       property3:
         {
           type: 'boolean',
           description: 'Property 3'
         },
       property4:
         {
           type: 'array',
           description: 'Property 4',
           items: {
             type: 'object',
             properties: {
               subProperty1:
                 {
                   type: 'string',
                   description: 'Sub Property 1'
                 }
             },
             required: ['subProperty1'],
             additionalProperties: false
           }
         }
     },
     required: ['property1', 'property2', 'property3', 'property4'],
     additionalProperties: false
    }

    @image_mime_type = "image/png"
    @image_data = "12345"
    @image_uri = "data:#{@image_mime_type};base64,#{@image_data}"

    @pdf_mime_type = "application/pdf"
    @pdf_data = "45678"
    @pdf_uri = "data:#{@pdf_mime_type};base64,#{@pdf_data}"

    AichatAssetHelper.stubs(:get_asset_data_uri).returns(@image_uri, @pdf_uri)
    AichatAssetHelper.stubs(:get_asset_base64_string).returns(@image_data, @pdf_data)
  end

  private def call_get_response(model_id, level, new_message, json_schema)
    usage_reporter = AichatAiUsageReporter.new(model_id, @user_id, @project_id, level.id)

    config, request, context = AichatAiHelper.get_config_request_context(
      @stored_messages,
      new_message,
      @temperature,
      @system_prompt,
      @retrieval_contexts,
      model_id,
      level.id,
      @encrypted_channel_id,
      @user_id,
      @project_id,
      @client_type,
      json_schema
    )

    AichatAiClient.create_instance(model_id, usage_reporter).get_response(
      config, request, context
    )
  end

  private def stub_request_and_get_response(new_message, url_to_post, expected_request_body, expected_headers, stubbed_response_body, model_id, level, json_schema = nil)
    stub_request(:post, url_to_post).
          with(
            body: expected_request_body,
            headers: expected_headers
        ).
        to_return(status: 200, body: stubbed_response_body.to_json, headers: {})

    call_get_response(model_id, level, new_message, json_schema)
  end
end
