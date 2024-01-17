require 'test_helper'

class OpenaiChatControllerTest < ActionController::TestCase
  setup do
    response = Net::HTTPResponse.new(nil, '200', nil)
    OpenaiChatHelper.stubs(:request_chat_completion).returns(response)
    OpenaiChatHelper.stubs(:get_chat_completion_response_message).returns({status: 200, json: {}})
    ShareFiltering.stubs(:find_failure).returns(nil)
  end

  # Student without ai tutor access is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  name: "student_no_access_test",
  user: :student,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # Teacher without ai tutor access is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  name: "teacher_no_access_test",
  user: :teacher,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # Student with ai tutor access disabled is unable to access the chat completion endpoint
  test_user_gets_response_for :chat_completion,
  name: "student_disabled_access_test",
  user: :student_without_ai_tutor_access,
  method: :post,
  params: {messages: [{role: "user", content: "Say this is a test!"}]},
  response: :forbidden

  # User with ai tutor access from permissions, post request with a messages param returns a success
  test_user_gets_response_for :chat_completion,
  name: "general_success_test",
  user: :ai_tutor_access,
  method: :post,
  params: {messages: [{role: "user", content: "this is a test!"}]},
  response: :success

  # Student with ai tutor access from experiment and section enablement, post request with a messages param returns a success
  test_user_gets_response_for :chat_completion,
  name: "student_success_test",
  user: :student_with_ai_tutor_access,
  method: :post,
  params: {messages: [{role: "user", content: "this is also a test!"}]},
  response: :success

  # Post request with a profane messages param returns a failure
  test 'returns failure when chat message contains profanity' do
    student = create(:student_with_ai_tutor_access)
    sign_in(student)
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'))
    post :chat_completion, params: {messages: [{role: "user", content: "damn you, robot!"}], locale: "en"}
    assert_equal json_response["status"], ShareFiltering::FailureType::PROFANITY
    assert_equal json_response["flagged_content"], "damn"
  end

  # Post request with a messages param containing PII returns a failure
  test 'returns failure when chat message contains PII' do
    student = create(:student_with_ai_tutor_access)
    sign_in(student)
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'l.lovegood@hogwarts.edu'))
    post :chat_completion, params: {messages: [{role: "user", content: "my email is l.lovegood@hogwarts.edu"}], locale: "en"}
    assert_equal json_response["status"], ShareFiltering::FailureType::EMAIL
    assert_equal json_response["flagged_content"], "l.lovegood@hogwarts.edu"
  end

  # Post request without a messages param returns a bad request
  test_user_gets_response_for :chat_completion,
  name: "no_messages_test",
  user: :ai_tutor_access,
  method: :post,
  params: {},
  response: :bad_request
end
