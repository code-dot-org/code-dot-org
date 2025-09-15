require_relative './aichat_ai_client_test'

class AichatGeminiClientTest < AichatAiClientTest
  let(:internal_model_id) {'gemini-2.0-flash'}
  let(:endpoint_model_id) {internal_model_id}

  let(:endpoint_url) {"https://generativelanguage.googleapis.com/v1beta/models/#{endpoint_model_id}:generateContent?key="}

  let(:json_schema) {nil}

  let(:generation_config) do
    {
      temperature: 1.0
    }
  end

  let(:generation_config_without_response_json_schema) do
    generation_config.merge(
      responseMimeType: "application/json"
    )
  end

  let(:request_body_without_contents) do
    {
      generationConfig: generation_config,
      system_instruction: {
        parts: [
          {text: "Be safe."},
          {text: "test prompt"},
          {text: "test retrieval"}
        ]
      }
    }
  end

  let(:request_headers) do
    {
      'Accept'=>'*/*',
          'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
          'Content-Type'=>'application/json',
          'User-Agent'=>'Ruby'

    }
  end

  let(:stubbed_success_response_body) do
    {
      candidates: [
        {
          content: {
            parts: [
              {
                text: @response_text
              }
            ],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }
      ],
      usageMetadata: {
        promptTokenCount: 3116,
        candidatesTokenCount: 82,
        totalTokenCount: 4103,
        promptTokensDetails: [
          {
            modality: "TEXT",
            tokenCount: 20
          },
          {
            modality: "DOCUMENT",
            tokenCount: 3096
          }
        ],
        thoughtsTokenCount: 905
      },
      modelVersion: endpoint_model_id,
      responseId: 'fkADaGzEE-12213GoO_3iAM'
    }
  end

  let(:stubbed_fail_response_body) do
    {
      error: {
        message: @specific_error_message
      }
    }
  end

  describe '#def get_response (unit)' do
    subject {stub_request_and_get_response(new_message, endpoint_url, request_body, request_headers, stubbed_response_body, internal_model_id, level, json_schema)}

    let(:contents_with_level_system_prompt) do
      [
        {role: "user", parts: [{text: "hello from user"}]},
        {role: "model", parts: [{text: "assistant response"}]},
        {role: "user", parts: [{text: "new message from user"}]}
      ]
    end

    let(:contents_without_level_system_prompt) do
      [
        {role: 'user', parts: [{text: 'hello from user'}]},
        {role: 'model', parts: [{text: 'assistant response'}]},
        {role: 'user', parts: [{text: 'new message from user'}]}
      ]
    end

    let(:contents_with_hidden_context_and_level_system_prompt) do
      [
        {role: 'user', parts: [{text: 'hello from user'}]},
        {role: 'model', parts: [{text: 'assistant response'}]},
        {role: 'user', parts: [{text: "new message from user"}]}
      ]
    end

    let(:contents_with_assets_and_without_level_system_prompt) do
      [
        {role: 'user', parts: [{text: 'hello from user'}]},
        {role: 'model', parts: [{text: 'assistant response'}]},
        {
          role: 'user',
          parts: [
            {text: 'message with assets'},
            {inline_data: {mime_type: @image_mime_type, data: @image_data}},
            {inline_data: {mime_type: @pdf_mime_type, data: @pdf_data}}
          ]
        }
      ]
    end

    let(:system_instruction_without_level_system_prompt) do
      {
        parts: [
          {text: "test prompt"},
          {text: "test retrieval"}
        ]
      }
    end

    let(:system_instruction_with_hidden_context_and_level_system_prompt) do
      {
        parts: [
          {text: "Be safe."},
          {text: "test prompt"},
          {text: "test retrieval"},
          {text: "hidden context text"}
        ]
      }
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
          request_body_without_contents.merge(
            {
              contents: contents_with_level_system_prompt
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
          request_body_without_contents.merge(
            {
              contents: contents_with_hidden_context_and_level_system_prompt,
              system_instruction: system_instruction_with_hidden_context_and_level_system_prompt
            }.deep_stringify_keys
          )
        end

        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'successfully makes request and is returned the correct response' do
          # Check that we've returned the correct response.
          assert_equal subject, @response_text
        end
      end

      context 'when json_schema has top level primitive' do
        let(:new_message) {@new_message}
        let(:json_schema) {@json_schema_with_top_level_primitive}

        # Don't expect any particular fields in body, we're just testing that we've
        # raised StandardError and don't want WebMock to fail before that
        let(:request_body) {{}}

        # Don't actually expect a response, but we still need a stub.
        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'raises StandardError' do
          # Check that we raise and that the error contains our error message.
          err = -> {subject}.must_raise(StandardError)
          err.message.must_include @ruby_types_error
        end
      end

      context 'when json_schema has top level array' do
        let(:new_message) {@new_message}
        let(:json_schema) {@json_schema_with_top_level_array}

        # Don't expect any particular fields in body, we're just testing that we've
        # raised StandardError and don't want WebMock to fail before that
        let(:request_body) {{}}

        # Don't actually expect a response, but we still need a stub.
        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'raises StandardError' do
          # Check that we raise and that the error contains our error message.
          err = -> {subject}.must_raise(StandardError)
          err.message.must_include @ruby_types_error
        end
      end

      context 'when json_schema is missing required object properties' do
        let(:new_message) {@new_message}
        let(:json_schema) {@json_schema_with_top_level_object_and_missing_required}

        # Don't expect any particular fields in body, we're just testing that we've
        # raised StandardError and don't want WebMock to fail before that
        let(:request_body) {{}}

        # Don't actually expect a response, but we still need a stub.
        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'raises StandardError' do
          # Check that we raise and that the error contains our error message.
          err = -> {subject}.must_raise(StandardError)
          err.message.must_include @json_schema_required_error
        end
      end

      context 'when json_schema has additionalProperties = true' do
        let(:new_message) {@new_message}
        let(:json_schema) {@json_schema_with_top_level_object_and_addition_properties_true}

        # Don't expect any particular fields in body, we're just testing that we've
        # raised StandardError and don't want WebMock to fail before that
        let(:request_body) {{}}

        # Don't actually expect a response, but we still need a stub.
        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'raises StandardError' do
          # Check that we raise and that the error contains our error message.
          err = -> {subject}.must_raise(StandardError)
          err.message.must_include @ruby_types_error
        end
      end

      context 'when json_schema has no additionalProperties' do
        let(:new_message) {@new_message}
        let(:json_schema) {@json_schema_with_top_level_object_and_no_addition_properties}

        # Don't expect any particular fields in body, we're just testing that we've
        # raised StandardError and don't want WebMock to fail before that
        let(:request_body) {{}}

        # Don't actually expect a response, but we still need a stub.
        let(:stubbed_response_body) {stubbed_success_response_body}
        it 'raises StandardError' do
          # Check that we raise and that the error contains our error message.
          err = -> {subject}.must_raise(StandardError)
          err.message.must_include @ruby_types_error
        end
      end

      context 'when json_schema is well formed' do
        let(:new_message) {@new_message}
        let(:json_schema) {@json_schema_with_top_level_object_and_all_required}

        let(:request_body) do
          request_body_without_contents.merge(
            {
              contents: contents_with_level_system_prompt,
              generationConfig: generation_config_without_response_json_schema.merge(
                responseJsonSchema: @json_schema_with_top_level_object_and_all_required
              )
            }
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
          request_body_without_contents.merge(
            {
              contents: contents_without_level_system_prompt,
              system_instruction: system_instruction_without_level_system_prompt
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
          request_body_without_contents.merge(
            {
              contents: contents_with_assets_and_without_level_system_prompt,
              system_instruction: system_instruction_without_level_system_prompt
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
