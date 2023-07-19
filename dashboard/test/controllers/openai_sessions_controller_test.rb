require 'test_helper'

class OpenaiSessionsControllerTest < ActionController::TestCase
  setup do
  end

  test 'chat_completion' do
    user = create :ai_chat_access
    sign_in(user)
    post :chat_completion, params: {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "system", "content": "You are a helpful assistant."}]
    }
    assert_response :success
  end

  # test_user_gets_response_for :chat_completion,
  # user: :ai_chat_access,
  # params: {"messages": [{"content":"","role":""}]},
  # response: :success
end
