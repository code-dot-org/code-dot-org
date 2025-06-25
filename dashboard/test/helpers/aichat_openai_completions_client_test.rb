require 'test_helper'

class AichatOpenaiCompletionsClientTest < AichatAiClientTest

  let(:model_id) {'gpt-4o-mini'}
  let(:response_text) {"some response text"}

  describe '#def get_response_text (unit)' do
    it 'sends POST with correct JSON body and parses correct response' do
      expected_body = {
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

      stubbed_response_body = {
        id: "chatcmpl-12345678901234567891234567890",
        object: "chat.completion",
        created: 1750694792,
        model: "gpt-4o-mini-2024-07-18",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: response_text,
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
        system_fingerprint: "fp_62a0c0d1ef"
      }

      stub_request(:post, "https://api.openai.com/v1/chat/completions").
          with(
            body: expected_body.to_json,
            headers: {
                  'Accept'=>'*/*',
                  'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
                  'Authorization'=>'Bearer',
                  'Content-Type'=>'application/json',
                  'User-Agent'=>'Ruby'
            }
        ).
        to_return(status: 200, body: stubbed_response_body.to_json, headers: {})
     
      actual_response = call_get_response_test(model_id)

      # assert that we get back response we sent after parsing 
      assert_equal actual_response , response_text
    
    end
  end 
end