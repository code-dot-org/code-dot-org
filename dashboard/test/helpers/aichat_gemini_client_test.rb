class AichatGeminiClientTest < AichatAiClientTest
  let(:internal_model_id) {'gemini-2.0-flash'}
  let(:endpoint_model_id) {internal_model_id}

  let(:endpoint_url) {"https://generativelanguage.googleapis.com/v1beta/models/#{endpoint_model_id}:generateContent?key="}

  let(:request_body_without_contents) do
    {
      generationConfig: {
        temperature: 1.0
      },
      system_instruction: {
        parts: [
          {
            text: "Be safe. test prompt test retrieval"
          }
        ]
      }
    }
  end

  let(:expected_headers) do
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
        code: 400
      }
    }
  end

  describe '#def get_response_text (unit)' do
    let(:contents) do
      [
        {
          role: "user",
          parts: [
            {
              text: "hello from user"
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text: "assistant response"
            }
          ]
        },
        {
          role: "user",
          parts: [
            {
              text: "new message from user"
            }
          ]
        }
      ]
    end

    let(:request_body) do
      request_body_without_contents.merge(
        {
          contents: contents
        }
      )
    end

    subject {stub_request_and_get_response_test(@new_message, endpoint_url, request_body, expected_headers, stubbed_response_body, internal_model_id, @level_with_level_system_prompt)}
    context 'when body is well formed and request succeeds' do
      let(:stubbed_response_body) {stubbed_success_response_body}
      it 'successfully makes a round trip and is returned the correct response' do
        # Check that we're returned the correct response.
        assert_equal subject, @response_text
      end
    end
    context 'when body is well formed and request fails with error JSON' do
      let(:stubbed_response_body) {stubbed_fail_response_body}
      it 'raises StandardError' do
        # Check that we raise.
        -> {subject}.must_raise(StandardError)
      end
    end
  end
end
