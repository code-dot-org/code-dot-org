require 'test_helper'

class OpenaiSessionsControllerTest < ActionController::TestCase
  include OpenaiChatHelper

  setup do
    response = Net::HTTPResponse.new(nil, '200', nil)
    OpenaiChatHelper.stubs(:request_chat_completion).returns(response)
    OpenaiChatHelper.stubs(:get_chat_completion_response_message).returns({})
  end

  test_user_gets_response_for :chat_completion,
  user: :levelbuilder,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  test_user_gets_response_for :chat_completion,
  user: :ai_chat_access,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :success
end
