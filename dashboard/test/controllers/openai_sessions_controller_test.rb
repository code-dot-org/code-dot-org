require 'test_helper'

class OpenaiSessionsControllerTest < ActionController::TestCase
  setup do
  end

  test_user_gets_response_for :chat_completion,
  method: :post,
  user: :student,
  response: :forbidden

  test_user_gets_response_for :chat_completion,
  user: :teacher,
  response: :forbidden

  # test_user_gets_response_for :chat_completion,
  # user: :ai_chat_access,
  # response: :success
end
