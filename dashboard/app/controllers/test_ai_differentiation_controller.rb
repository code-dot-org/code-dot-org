# Provides a stub for the AI proxy API, for testing purposes. Routes here
# should match the routes defined in https://github.com/code-dot-org/aiproxy
class TestAiDifferentiationController < ApplicationController
  layout false

  # CSRF token is not available to the requester, because this API is called
  # from an Active Job and not from the browser.
  skip_before_action :verify_authenticity_token

  # POST /api/test/ai_diff/message
  #
  # Provides a fake assessment where every key concept is given a score of
  # Convincing Evidence.
  def message
    response_data = {
      "ResponseMetadata" =>  {
        "RequestId" => "1b8cb8f7-7558-4837-8b8d-580568316fb1",
        "HTTPStatusCode" => 200,
        "HTTPHeaders" => {
          "date" => "Mon, 22 Jul 2024 16:15:09 GMT",
          "content-type" => "application/json",
          "content-length" =>  "7648",
          "connection" => "keep-alive",
          "x-amzn-requestid" => "1b8cb8f7-7558-4837-8b8d-580568316fb1"
        },
        "RetryAttempts" => 0
      },
      "citations" => [
        {
          "generatedResponsePart" => {
            "textResponsePart" => {
              "span" => {
                "end" => 55,
                "start" => 0
              },
              "text" => "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            }
          },
          "retrievedReferences" => [
            {
              "content" => {
                "text" => "As Gregor Samsa awoke one morning from unsettling dreams, he found himself transformed in his bed into a monstrous vermin."
              },
              "location" => {
                "s3Location" => {
                  "uri" => "s3://dummy_file"
                },
                "type" => "S3"
              },
              "metadata" => {
                "x-amz-bedrock-kb-source-uri" => "s3://dummy_file",
                "unit" => "U3",
                "unit_fullname" => "Unit 3 - Interactive Animations and Games ('23-'24)",
                "x-amz-bedrock-kb-data-source-id" => "0123456789",
                "lesson" => "all",
                "course" => "csd-2023",
                "x-amz-bedrock-kb-chunk-id" => "1%3A0%3Ak3ymwpABDbxWcu6z92Ww"
              }
            }
          ]
        }
      ],
      "output" => {
        "text" => "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      },
      "sessionId" => "123456"
    }
    render json: {data: response_data}
  end
end
