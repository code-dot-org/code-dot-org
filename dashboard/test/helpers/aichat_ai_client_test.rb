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
    @temperature = 0.5
    @system_prompt = 'test prompt'
    @retrieval_contexts = ['test retrieval']
    @level_id = 'Aichat level'
    @encrypted_channel_id = 12345
    @user_id = 'test-user'
    @project_id = 'Aichat project'
    @response_text = "some response text"

    @level = Level.create({name: @level_id, properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
  end

  private def call_get_response_text(model_id)
    AichatAiClient.create_instance(model_id).get_response_text(
      @stored_messages,
         @new_message,
         @temperature,
         @system_prompt,
         @retrieval_contexts,
         model_id,
         @level.id,
         @encrypted_channel_id,
         @user_id,
         @project_id
      )
  end
  private def stub_request_and_get_response_test(url_to_post, expected_request_body, expected_headers, stubbed_response_body, model_id)
    stub_request(:post, url_to_post).
          with(
            body: expected_request_body,
            headers: expected_headers
        ).
        to_return(status: 200, body: stubbed_response_body.to_json, headers: {})

    call_get_response_text(model_id)
  end
end
