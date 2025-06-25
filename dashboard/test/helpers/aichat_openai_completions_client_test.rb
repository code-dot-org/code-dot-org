class AichatOpenaiCompletionsClientTest < AichatAiClientTest
  let(:gpt_4o_mini_model_id) {'gpt-4o-mini'}

  # TODO - get model from gpt_4o_mini_model_id once we have hash of model_id => model/key/provider
  let(:expected_request_body) do
    {
      model: "gpt-4o-mini-2024-07-18",
      temperature: 1.0,
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
          text: "Be safe. test prompt test retrieval"
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "hello from user"
            }
          ]
        },
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "assistant response"
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "new message from user"
            }
          ]
        }
      ]
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
      model: "gpt-4o-mini-2024-07-18",
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
    let(:internal_model_id) {gpt_4o_mini_model_id}

    #TODO - use hash to go from internal_model_id to model_id (since these aren't same for openai)
    # and switch based on different models
    let(:model_id) {internal_model_id}

    let(:url_to_post) {"https://api.openai.com/v1/chat/completions"}

    subject {stub_request_and_get_response_test(url_to_post, expected_request_body, expected_headers, stubbed_response_body, model_id)}
    context 'when body is well formed and request succeeds' do
      let(:stubbed_response_body) {stubbed_success_response_body}
      it 'successfully makes a round trip and is returned the correct response' do
        #check that we're returned the correct response
        assert_equal subject, @response_text
      end
    end
    context 'when body is well formed and request fails with error JSON' do
      let(:stubbed_response_body) {stubbed_fail_response_body}
      it 'raises StandardError' do
        #check that we raise
        -> {subject}.must_raise(StandardError)
      end
    end
  end
end
