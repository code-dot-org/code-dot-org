require "test_helper"

class AidiffMessageFeedbackTest < ActiveSupport::TestCase
  setup_all do
    @user = create :user
  end

  test 'thread, message, feedback create' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    assert thread.aidiff_messages.empty?

    message1 = AidiffMessage.create!(
      role: :user,
      content: 'Open the pod bay doors, HAL.',
      aidiff_thread: thread,
      external_id: 'message1',
      is_preset: false
    )

    message2 = AidiffMessage.create!(
      role: :assistant,
      content: "I'm sorry Dave, I'm afraid I can't do that.",
      aidiff_thread: thread,
      external_id: 'message2',
      is_preset: false
    )

    assert_equal [message1, message2], thread.reload.aidiff_messages
    assert_equal 'openai_1234', message1.aidiff_thread.external_id
    assert message1.aidiff_message_feedback.nil?

    feedback = AidiffMessageFeedback.create!(
      teacher_id: @user.id,
      aidiff_message: message1,
      approval: true,
      flagged: false
    )

    assert_equal feedback, message1.aidiff_message_feedback
    assert_equal feedback.aidiff_message_id, message1.id
  end
end
