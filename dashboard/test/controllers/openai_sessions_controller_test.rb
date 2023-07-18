require 'test_helper'

class OpenaiSessionsControllerTest < ActionController::TestCase
  setup do
    put_response = Net::HTTPResponse.new(nil, '200', {key:"value"})
    puts "setup"
    puts "#{put_response.body}"
    OpenaiChatHelper.stubs(:get_chat_completion_response).returns(put_response)
  end

  test_user_gets_response_for :chat_completion,
  method: :post,
  user: :student,
  response: :forbidden

  test_user_gets_response_for :chat_completion,
  user: :teacher,
  response: :forbidden

  test_user_gets_response_for :chat_completion,
  user: :ai_chat_access,
  params: {"messages": [{"content":"","role":""}]},
  response: :success
end
