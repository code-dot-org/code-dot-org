require 'test_helper'

class AidiffMessagesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @teacher = create(:teacher)
    @teacher_thread = create(:aidiff_thread, user: @teacher)
    @message = create(:aidiff_message, aidiff_thread: @teacher_thread)
    @message_not_teacher = create(:aidiff_message)
    @teacher_sans_experiment = create(:teacher)
    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-differentiation')
  end

  test "submit feedback returns forbidden if not a teacher" do
    student = create(:student)
    create(:follower, student_user: student, user: @teacher)

    sign_in student

    post :submit_feedback, params: {
      id: @message.id,
      approval: true,
      flagged: false
    }

    assert_response :forbidden
  end

  test "submit feedback returns forbidden if ai_diff experiment isn't enabled" do
    sign_in @teacher_sans_experiment

    post :submit_feedback, params: {
      id: @message.id,
      approval: true,
      flagged: false
    }

    assert_response :forbidden
  end

  test "submit feedback returns forbidden if user doesn't own the message thread" do
    sign_in @teacher

    post :submit_feedback, params: {
      id: @message_not_teacher.id,
      approval: true,
      flagged: false
    }

    assert_response :forbidden
  end

  test "creates a new feedback when there is no feedback" do
    sign_in @teacher

    post :submit_feedback, params: {
      id: @message.id,
      approval: true,
      flagged: false
    }

    assert_response :success
    assert_equal @message.aidiff_message_feedback.approval, true
    assert_equal @message.aidiff_message_feedback.flagged, false
  end

  test "updates feedback when feedback exists" do
    sign_in @teacher

    post :submit_feedback, params: {
      id: @message.id,
      approval: true,
      flagged: false
    }

    assert_response :success
    assert_equal @message.aidiff_message_feedback.approval, true
    assert_equal @message.aidiff_message_feedback.flagged, false

    feedback_id = @message.aidiff_message_feedback.id

    post :submit_feedback, params: {
      id: @message.id,
      approval: false,
      flagged: true
    }

    @message.reload

    assert_response :success
    assert_equal feedback_id, @message.aidiff_message_feedback.id
    assert_equal @message.aidiff_message_feedback.approval, false
    assert_equal @message.aidiff_message_feedback.flagged, true
  end
end
