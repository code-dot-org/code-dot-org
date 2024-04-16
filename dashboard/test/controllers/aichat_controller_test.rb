require 'test_helper'

class AichatControllerTest < ActionController::TestCase
  GENAI_PILOT = "genai-pilot"

  setup_all do
    @genai_pilot = create :pilot
    @genai_pilot.name = GENAI_PILOT
    @pilot_teacher = create :teacher, pilot_experiment: GENAI_PILOT
    @section = create(:section, user: @pilot_teacher)
    @pilot_student = create(:follower, section: @section).student_user
    @params = {
      storedMessages: [{role: "user", content: "this is a test!"}],
      aichatParameters: {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"},
      chatContext: {userId: 1, currentLevelId: "test", scriptId: 1, channelId: "test"}
    }
    valid_message = "hello"
    pii_violation_message = "my email is l.lovepadel@sports.edu"
    profanity_violation_message = "Damn you, robot"
    @valid_params = @params.merge(newMessage: valid_message)
    @pii_violation_params = @params.merge(newMessage: pii_violation_message)
    @profanity_violation_params = @params.merge(newMessage: profanity_violation_message)
  end

  test_user_gets_response_for :chat_completion,
    name: "student_no_access_test",
    user: :student,
    method: :post,
    response: :forbidden

  test_user_gets_response_for :chat_completion,
    name: "teacher_no_access_test",
    user: :teacher,
    method: :post,
    response: :forbidden

  test 'pilot teacher has access test' do
    sign_in(@pilot_teacher)
    post :chat_completion, params: @valid_params
    assert_response :success
  end

  test 'pilot student has access test' do
    sign_in(@pilot_student)
    post :chat_completion, params: @valid_params
    assert_response :success
  end

  test 'Bad request if required params are not included' do
    sign_in(@pilot_teacher)
    post :chat_completion, params: {newMessage: "hello"}
    assert_response :bad_request
  end

  # Post request with a profane messages param returns a failure
  test 'returns failure when chat message contains profanity' do
    sign_in(@pilot_student)
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'))
    post :chat_completion, params: @profanity_violation_params
    assert_equal json_response["status"], ShareFiltering::FailureType::PROFANITY
    assert_equal json_response["flagged_content"], "damn"
  end

  # Post request with a messages param containing PII returns a failure
  test 'returns failure when chat message contains PII' do
    sign_in(@pilot_student)
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'l.lovepadel@sports.edu'))
    post :chat_completion, params: @pii_violation_params
    assert_equal json_response["status"], ShareFiltering::FailureType::EMAIL
    assert_equal json_response["flagged_content"], "l.lovepadel@sports.edu"
  end
end
