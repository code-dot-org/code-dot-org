class AichatGeminiClientTest < AichatAiClientTest
  let(:gemini_model_id) {'gemini-2.0-flash'}
  let(:expected_request_body) do
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
      },
      contents: [
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
      modelVersion: "gemini-2.0-flash",
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
    let(:internal_model_id) {gemini_model_id}

    let(:model_id) {internal_model_id}

    let(:url_to_post) {"https://generativelanguage.googleapis.com/v1beta/models/#{model_id}:generateContent?key="}

    subject {stub_request_and_get_response_test(url_to_post, expected_request_body, expected_headers, stubbed_response_body, model_id)}
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
