require 'aws-sdk-s3'
require 'test_helper'

class OpenaiChatControllerTest < ActionController::TestCase
  setup do
    response = Net::HTTPResponse.new(nil, '200', nil)
    OpenaiChatHelper.stubs(:request_chat_completion).returns(response)
    OpenaiChatHelper.stubs(:get_chat_completion_response_message).returns({status: 200, json: {}})
    ShareFiltering.stubs(:find_failure).returns(nil)

    @mock_s3_client = mock
    OpenaiChatController.any_instance.stubs(:s3_client).returns(@mock_s3_client)
    stubbed_response = stub
    stubbed_response.stubs(:body).returns(stub(read: "Content of the system prompt file"))
    @mock_s3_client.stubs(:get_object).with(bucket: OpenaiChatController::S3_AI_BUCKET, key: 'tutor/system_prompt.txt').returns(stubbed_response)

    @controller = OpenaiChatController.new
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

  test 'prepend_system_prompt appends level instructions to system prompt and prepends to messages' do
    system_prompt = "Content of the system prompt file"
    level_instructions = "Follow these steps"
    messages = [{role: "user", content: "User question"}]

    result = @controller.send(:prepend_system_prompt, system_prompt, level_instructions, messages)
    assert_equal 2, result.size
    assert_equal "Content of the system prompt file\n Here are the student instructions for this level: Follow these steps", result.first[:content]
    assert_equal "system", result.first[:role]
    assert_equal "User question", result.last[:content]
  end

  test 'prepend_system_prompt does not append level instructions when they are nil' do
    system_prompt = "Content of the system prompt file"
    level_instructions = nil
    messages = [{role: "user", content: "User question"}]

    result = @controller.send(:prepend_system_prompt, system_prompt, level_instructions, messages)
    assert_equal 2, result.size
    assert_equal "Content of the system prompt file", result.first[:content], "System prompt should not append nil level instructions"
    assert_equal "system", result.first[:role]
    assert_equal "User question", result.last[:content]
  end

  test 'read_file_from_s3 retrieves the correct system prompt' do
    assert_equal "Content of the system prompt file", @controller.send(:read_file_from_s3, 'tutor/system_prompt.txt')
  end

  test 'read_file_from_s3 reads from local file system in development' do
    key_path = OpenaiChatController::S3_TUTOR_SYSTEM_PROMPT_PATH
    expected_content = "Local system prompt"
    Rails.stubs(:env).returns(ActiveSupport::StringInquirer.new("development"))

    local_path = File.join("local-aws", OpenaiChatController::S3_AI_BUCKET, key_path)
    File.stubs(:exist?).with(local_path).returns(true)
    File.stubs(:read).with(local_path).returns(expected_content)

    assert_equal expected_content, @controller.send(:read_file_from_s3, key_path)
  end

  test 'read_file_from_s3 handles errors when S3 file is not found' do
    key_path = 'nonexistent/file.txt'
    @mock_s3_client.stubs(:get_object).with(bucket: OpenaiChatController::S3_AI_BUCKET, key: key_path).
      raises(Aws::S3::Errors::NoSuchKey.new(nil, "The specified key does not exist."))

    exception = assert_raises(Aws::S3::Errors::NoSuchKey) do
      @controller.send(:read_file_from_s3, key_path)
    end

    assert_equal "The specified key does not exist.", exception.message
  end

  # Post request without a messages param returns a bad request
  test_user_gets_response_for :chat_completion,
  name: "no_messages_test",
  user: :ai_tutor_access,
  method: :post,
  params: {},
  response: :bad_request
end
