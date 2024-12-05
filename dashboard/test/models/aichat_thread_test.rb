require 'test_helper'

class AichatThreadTest < ActiveSupport::TestCase
  setup_all do
    @user = create :user
  end

  test 'thread and message create' do
    thread = AichatThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3
    )

    assert thread.aichat_messages.empty?

    message1 = AichatMessage.create!(
      role: :user,
      content: 'Open the pod bay doors, HAL.',
      aichat_thread: thread,
      external_id: 'message1',
      is_preset: false
    )

    message2 = AichatMessage.create!(
      role: :assistant,
      content: "I'm sorry Dave, I'm afraid I can't do that.",
      aichat_thread: thread,
      external_id: 'message2',
      is_preset: false
    )

    assert_equal [message1, message2], thread.reload.aichat_messages
    assert_equal 'openai_1234', message1.aichat_thread.external_id
  end
end
