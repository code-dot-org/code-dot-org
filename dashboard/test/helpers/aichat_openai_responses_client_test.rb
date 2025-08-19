require_relative './aichat_ai_client_test'

class AichatOpenaiResponsesClientTest < AichatAiClientTest
  let(:internal_model_id) {'gpt-4o-mini'}
  let(:endpoint_model_id) {'gpt-4o-mini-2024-07-18'}

  let(:endpoint_url) {"https://api.openai.com/v1/responses"}

  let(:request_body_without_input) do
    {
      model: endpoint_model_id,
      temperature: 0.75
    }
  end

  let(:request_headers) do
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
      id: "resp_123456789012345678912345678901234567890123456789",
      object: "response",
      created: 1_751_504_177,
      model: endpoint_model_id,
      output: [
        {
          id: "msg_123456789012345678912345678901234567890123456789",
            type: "message",
            status: "completed",
            content: [
              {
                type: "output_text",
                  annotations: [],
                  logprobs: [],
                  text: @response_text
              }
            ],
            role: "assistant"
        }
      ],

      tool_choice: "auto",
      tools: [],
      top_logprobs: 0,
      top_p: 1.0,
      truncation: "disabled",
      usage: {
        input_tokens: 10099,
         input_tokens_details: {
           cached_tokens: 0
         },
        output_tokens: 87,
        output_tokens_details: {
          reasoning_tokens: 0
        },
        total_tokens: 10186
      },
      user: nil,
      metadata: {}
    }
  end

  let(:stubbed_fail_response_body) do
    {
      error: {
        message: @specific_error_message
      }
    }
  end

  describe '#def get_response_text (unit)' do
    subject {stub_request_and_get_response_text(new_message, endpoint_url, request_body, request_headers, stubbed_response_body, internal_model_id, level)}

    let(:input_with_level_system_prompt) do
      [
        {role: 'system', content: [
          {type: 'input_text', text: "Be safe."},
          {type: 'input_text', text: "test prompt"},
          {type: 'input_text', text: "test retrieval"}
        ]},
        {role: "user", content: [{type: "input_text", text: "hello from user"}]},
        {role: "assistant", content: [{type: "output_text", text: "assistant response"}]},
        {role: "user", content: [{type: "input_text", text: "new message from user"}]}
      ]
    end

    let(:input_without_level_system_prompt) do
      [
        {role: 'system', content: [
          {type: 'input_text', text: "test prompt"},
          {type: 'input_text', text: "test retrieval"}
        ]},
        {role: 'user', content: [{type: 'input_text', text: 'hello from user'}]},
        {role: 'assistant', content: [{type: 'output_text', text: 'assistant response'}]},
        {role: 'user', content: [{type: 'input_text', text: 'new message from user'}]}
      ]
    end

    let(:input_with_assets_and_without_level_system_prompt) do
      [
        {role: 'system', content: [
          {type: 'input_text', text: "test prompt"},
          {type: 'input_text', text: "test retrieval"}
        ]},
        {role: 'user', content: [{type: 'input_text', text: 'hello from user'}]},
        {role: 'assistant', content: [{type: 'output_text', text: 'assistant response'}]},
        {role: 'user', content: [
          {type: 'input_text', text: 'message with assets'},
          {type: 'input_image', image_url: @image_uri},
          {type: 'input_file', filename: 'file.pdf', file_data: @pdf_uri}
        ]}
      ]
    end

    let(:input_with_hidden_context_and_level_system_prompt) do
      [
        {role: 'system', content: [
          {type: 'input_text', text: "Be safe."},
          {type: 'input_text', text: "test prompt"},
          {type: 'input_text', text: "test retrieval"}
        ]},
        {role: 'user', content: [{type: 'input_text', text: 'hello from user'}]},
        {role: 'assistant', content: [{type: 'output_text', text: 'assistant response'}]},
        {role: 'user', content: [{type: 'input_text', text: "new message from user\nextra text"}]}
      ]
    end

    context 'with level system prompt' do
      let(:level) {@level_with_level_system_prompt}

      context 'when body is well formed and request fails with error JSON' do
        let(:new_message) {@new_message}
        # Don't expect any particular fields in body, we're just testing that we've
        # raised StandardError and don't want WebMock to fail before that
        let(:request_body) {{}}

        let(:stubbed_response_body) {stubbed_fail_response_body}
        it 'raises StandardError' do
          # Check that we raise and that the error contains our error message.
          err = -> {subject}.must_raise(StandardError)
          err.message.must_include @specific_error_message
        end
      end

      context 'when body is well formed and request succeeds' do
        let(:new_message) {@new_message}
        let(:request_body) do
          request_body_without_input.merge(
            {
              input: input_with_level_system_prompt
            }
          )
        end

        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'successfully makes request and is returned the correct response' do
          # Check that we've returned the correct response.
          assert_equal subject, @response_text
        end
      end

      context 'when body is well formed with hidden context and request succeeds' do
        let(:new_message) {@new_message_with_hidden_context}
        let(:level) {@level_with_level_system_prompt}

        let(:request_body) do
          request_body_without_input.merge(
            {
              input: input_with_hidden_context_and_level_system_prompt
            }.deep_stringify_keys
          )
        end

        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'successfully makes request and is returned the correct response' do
          # Check that we've returned the correct response.
          assert_equal subject, @response_text
        end
      end
    end

    context 'without level system prompt' do
      let(:level) {@level_without_level_system_prompt}

      context 'when body is well formed and request succeeds' do
        let(:new_message) {@new_message}
        let(:request_body) do
          request_body_without_input.merge(
            {
              input: input_without_level_system_prompt
            }
          )
        end

        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'successfully makes request and is returned the correct response' do
          # Check that we've returned the correct response.
          assert_equal subject, @response_text
        end
      end

      context 'when body is well formed and with assets and request succeeds' do
        let(:new_message) {@new_message_with_assets}
        let(:request_body) do
          request_body_without_input.merge(
            {
              input: input_with_assets_and_without_level_system_prompt
            }.deep_stringify_keys
          )
        end

        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'successfully makes request and is returned the correct response' do
          # Check that we've returned the correct response.
          assert_equal subject, @response_text
        end
      end
    end
  end
end
