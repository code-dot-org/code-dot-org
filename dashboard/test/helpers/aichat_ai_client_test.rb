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
    @new_message_with_hidden_context = {role: 'user', chatMessageText: 'new message from user', hiddenContext: 'extra text'}.stringify_keys
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

    @level_with_level_system_prompt = Level.create({name: 'Aichat level', properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
    @level_without_level_system_prompt = Level.create({name: 'Aichat level without level system prompt', properties: {aichat_settings: {}}})

    @image_mime_type = "image/png"
    @image_data = "12345"
    @image_uri = "data:#{@image_mime_type};base64,#{@image_data}"

    @pdf_mime_type = "application/pdf"
    @pdf_data = "45678"
    @pdf_uri = "data:#{@pdf_mime_type};base64,#{@pdf_data}"

    AichatAssetHelper.stubs(:get_asset_data_uri).returns(@image_uri, @pdf_uri)
    AichatAssetHelper.stubs(:get_asset_base64_string).returns(@image_data, @pdf_data)
  end

  private def call_get_response_text(model_id, level, new_message)
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
      @client_type
    )

    AichatAiClient.create_instance(model_id, usage_reporter).get_response_text(
      config, request, context
    )
  end

  private def stub_request_and_get_response_text(new_message, url_to_post, expected_request_body, expected_headers, stubbed_response_body, model_id, level)
    stub_request(:post, url_to_post).
          with(
            body: expected_request_body,
            headers: expected_headers
        ).
        to_return(status: 200, body: stubbed_response_body.to_json, headers: {})

    call_get_response_text(model_id, level, new_message)
  end
end
