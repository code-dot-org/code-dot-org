require 'test_helper'

class OpenaiChatControllerTest < ActionController::TestCase
  setup do
    response = Net::HTTPResponse.new(nil, '200', nil)
    OpenaiChatHelper.stubs(:request_chat_completion).returns(response)
    OpenaiChatHelper.stubs(:get_chat_completion_response_message).returns({status: 200, json: {}})
  end

  # User without ai_chat_access is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  user: :levelbuilder,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # With ai_chat_access, a post request without a messages param returns a bad request
  test_user_gets_response_for :chat_completion,
  user: :ai_chat_access,
  method: :post,
  params: {},
  response: :bad_request

  # With ai_chat_access, a post request with a messages param returns a success
  test_user_gets_response_for :chat_completion,
  user: :ai_chat_access,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :success
end
