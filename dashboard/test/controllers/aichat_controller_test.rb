require 'test_helper'

class AichatControllerTest < ActionController::TestCase
  GENAI_PILOT = "genai-pilot"

  setup_all do
    @genai_pilot = create :pilot
    @genai_pilot.name = GENAI_PILOT
    @pilot_teacher = create :teacher, pilot_experiment: GENAI_PILOT
    @section = create(:section, user: @pilot_teacher)
    @pilot_student = create(:follower, section: @section).student_user
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
    post :chat_completion, params: {
      newMessage: "hello",
      storedMessages: [{role: "user", content: "this is a test!"}],
      aichatParameters: {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"},
      chatContext: {userId: 1, currentLevelId: "test", scriptId: 1, channelId: "test"}
    }
    assert_response :success
  end

  test 'pilot student has access test' do
    sign_in(@pilot_student)
    post :chat_completion, params: {
      newMessage: "hello",
      storedMessages: [{role: "user", content: "this is a test!"}],
      aichatParameters: {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"},
      chatContext: {userId: 1, currentLevelId: "test", scriptId: 1, channelId: "test"}
    }
    assert_response :success
  end

  test 'Bad request if required params are not included' do
    sign_in(@pilot_teacher)
    post :chat_completion, params: {newMessage: "hello"}
    assert_response :bad_request
  end
end
