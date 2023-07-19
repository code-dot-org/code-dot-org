require 'test_helper'

class OpenaiSessionsControllerTest < ActionController::TestCase
  include OpenaiChatHelper

  # response = {"choices": [{
  #   "index": 0,
  #   "message": {
  #     "role": "assistant",
  #     "content": "Hello there, how may I assist you today?",
  #   },
  #   "finish_reason": "stop"
  # }], "code": 200
  # }
  # OpenaiChatHelper.stubs(:get_chat_completion_response).returns({code: 200})
  # test_user_gets_response_for :chat_completion,
  # user: :ai_chat_access,
  # method: :post,
  # params: {"messages": [{"role": "system", "content": "You are a helpful assistant."}]},
  # response: :success

  test 'chat_completion' do
    user = create :ai_chat_access
    sign_in(user)
    post :chat_completion, params: {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "system", "content": "You are a helpful assistant."}]
    }
    assert_response :success
  end
end
