class AichatOpenaiCompletionsClientTest < AichatAiClientTest
  let(:internal_model_id) {'gpt-4o-mini'}
  let(:endpoint_model_id) {'gpt-4o-mini-2024-07-18'}

  let(:endpoint_url) {"https://api.openai.com/v1/chat/completions"}

  let(:request_body_without_messages) do
    {
      model: endpoint_model_id,
      temperature: 1.0
    }
  end

  let(:expected_headers) do
    {
      'Accept'=>'*/*',
            'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
            'Authorization'=>'Bearer',
            'Content-Type'=>'application/json',
            'User-Agent'=>'Ruby'
    }
  end

  let(:stubbed_success_response_body) do
    {
      id: "chatcmpl-12345678901234567891234567890",
      object: "chat.completion",
      created: 1_750_694_792,
      model: endpoint_model_id,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: @response_text,
            refusal: nil,
            annotations: []
          },
          logprobs: nil,
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 6070,
        completion_tokens: 111,
        total_tokens: 6181,
        prompt_tokens_details: {
          cached_tokens: 0,
          audio_tokens: 0
        },
        completion_tokens_details: {
          reasoning_tokens: 0,
          audio_tokens: 0,
          accepted_prediction_tokens: 0,
          rejected_prediction_tokens: 0
        }
      },
      service_tier: "default",
      system_fingerprint: "fp_62a0000def"
    }
  end

  let(:stubbed_fail_response_body) do
    {
      error: {
        message: 'some error message'
      }
    }
  end

  describe '#def get_response_text (unit)' do
    let(:messages_with_level_system_prompt) do
      [
        {role: "system", content: [{type: "text", text: "Be safe. test prompt test retrieval"}]},
        {role: "user", content: [{type: "text", text: "hello from user"}]},
        {role: "assistant", content: [{type: "text", text: "assistant response"}]},
        {role: "user", content: [{type: "text", text: "new message from user"}]}
      ]
    end

    let(:messages_without_level_system_prompt) do
      [
        {role: 'system', content: [{type: 'text', text: "test prompt test retrieval"}]},
        {role: 'user', content: [{type: 'text', text: 'hello from user'}]},
        {role: 'assistant', content: [{type: 'text', text: 'assistant response'}]},
        {role: 'user', content: [{type: 'text', text: 'new message from user'}]}
      ]
    end

    let(:messages_with_assets_without_level_system_prompt) do
      [
        {role: 'system', content: [{type: 'text', text: "test prompt test retrieval"}]},
        {role: 'user', content: [{type: 'text', text: 'hello from user'}]},
        {role: 'assistant', content: [{type: 'text', text: 'assistant response'}]},
        {role: 'user', content: [
          {type: 'text', text: 'message with assets'},
          {type: 'image_url', image_url: {url: @image_uri}},
          {type: 'file', file: {filename: 'file.pdf', file_data: @pdf_uri}}
        ]}
      ]
    end

    let(:messages_with_hidden_context_with_level_system_prompt) do
      [
        {role: 'system', content: [{type: 'text', text: "Be safe. test prompt test retrieval"}]},
        {role: 'user', content: [{type: 'text', text: 'hello from user'}]},
        {role: 'assistant', content: [{type: 'text', text: 'assistant response'}]},
        {role: 'user', content: [{type: 'text', text: "new message from user\nextra text"}]}
      ]
    end
    context 'when body is well formed and request fails with error JSON' do
      subject {stub_request_and_get_response_test(@new_message, endpoint_url, request_body, expected_headers, stubbed_response_body, internal_model_id, @level_with_level_system_prompt)}

      # Don't expect any particular fields in body, we're just testing that we
      let(:request_body) {{}}

      let(:stubbed_response_body) {stubbed_fail_response_body}
      it 'raises StandardError' do
        # Check that we raise.
        -> {subject}.must_raise(StandardError)
      end
    end

    context 'when body is well formed and request succeeds' do
      subject {stub_request_and_get_response_test(@new_message, endpoint_url, request_body, expected_headers, stubbed_response_body, internal_model_id, @level_with_level_system_prompt)}

      let(:request_body) do
        request_body_without_messages.merge(
          {
            messages: messages_with_level_system_prompt
          }
        )
      end

      let(:stubbed_response_body) {stubbed_success_response_body}
      it 'successfully makes a round trip and is returned the correct response' do
        # Check that we're returned the correct response.
        assert_equal subject, @response_text
      end
    end

    context 'when body is well formed without level system prompt and request succeeds' do
      subject {stub_request_and_get_response_test(@new_message, endpoint_url, request_body, expected_headers, stubbed_response_body, internal_model_id, @level_without_level_system_prompt)}

      let(:request_body) do
        request_body_without_messages.merge(
          {
            messages: messages_without_level_system_prompt
          }
        )
      end

      let(:stubbed_response_body) {stubbed_success_response_body}
      it 'successfully makes a round trip and is returned the correct response' do
        # Check that we're returned the correct response.
        assert_equal subject, @response_text
      end
    end

    context 'when body is well formed without level system prompt and with assets and request succeeds' do
      subject {stub_request_and_get_response_test(@new_message_with_assets, endpoint_url, request_body, expected_headers, stubbed_response_body, internal_model_id, @level_without_level_system_prompt)}

      let(:request_body) do
        request_body_without_messages.merge(
          {
            messages: messages_with_assets_without_level_system_prompt
          }.deep_stringify_keys
        )
      end

      let(:stubbed_response_body) {stubbed_success_response_body}
      it 'successfully makes a round trip and is returned the correct response' do
        # Check that we're returned the correct response.
        assert_equal subject, @response_text
      end
    end

    context 'when body is well formed with hidden context and level system prompt and request succeeds' do
      subject {stub_request_and_get_response_test(@new_message_hidden_context, endpoint_url, request_body, expected_headers, stubbed_response_body, internal_model_id, @level_with_level_system_prompt)}

      let(:request_body) do
        request_body_without_messages.merge(
          {
            messages: messages_with_hidden_context_with_level_system_prompt
          }.deep_stringify_keys
        )
      end

      let(:stubbed_response_body) {stubbed_success_response_body}
      it 'successfully makes a round trip and is returned the correct response' do
        # Check that we're returned the correct response.
        assert_equal subject, @response_text
      end
    end
  end
end
