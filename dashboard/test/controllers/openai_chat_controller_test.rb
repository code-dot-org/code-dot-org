require 'test_helper'

class OpenaiChatControllerTest < ActionController::TestCase
  setup do
    response = Net::HTTPResponse.new(nil, '200', nil)
    OpenaiChatHelper.stubs(:request_chat_completion).returns(response)
    OpenaiChatHelper.stubs(:get_chat_completion_response_message).returns({status: 200, json: {}})
  end

  # Student without ai tutor access is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  user: :student,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # Teacher without ai tutor access is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  user: :teacher,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # Student with ai tutor access disabled is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  user: :student_without_ai_tutor_access,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # User with ai tutor access from permissions, post request with a messages param returns a success
  test_user_gets_response_for :chat_completion,
  user: :ai_tutor_access,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :success

  # Student with ai tutor access from experiment and section enablement, post request with a messages param returns a success
  test_user_gets_response_for :chat_completion,
  user: :student_with_ai_tutor_access,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :success

  # A post request without a messages param returns a bad request
  test_user_gets_response_for :chat_completion,
  user: :ai_tutor_access,
  method: :post,
  params: {},
  response: :bad_request
end
