require "test_helper"

class AidiffArtifactTest < ActiveSupport::TestCase
  setup_all do
    create(:level, name: 'collision')
    @user = create(:user)
  end

  test 'create artifacts of different types' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    thread2 = create(:aidiff_thread, user: @user)
    thread3 = create(:aidiff_thread, user: @user)

    assert thread.aidiff_artifact.nil?

    exit_ticket = AidiffExitTicket.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json
    )

    lesson_hook = AidiffLessonHook.create!(
      aidiff_thread: thread2,
      user: @user,
      title: "Another title",
      content: {stuff: "things"}.to_json
    )

    lesson_hook2 = AidiffLessonHook.create!(
      aidiff_thread: thread3,
      user: @user,
      title: "blahblahblah",
      content: {stuff: "things"}.to_json
    )

    assert_equal exit_ticket, thread.reload.aidiff_artifact
    assert_equal lesson_hook, thread2.reload.aidiff_artifact
    assert_equal lesson_hook2, thread3.reload.aidiff_artifact

    assert 1, AidiffExitTicket.where(user_id: @user.id).count
    assert 2, AidiffLessonHook.where(user_id: @user.id).count
    assert 3, AidiffArtifact.where(user_id: @user.id).count
  end
end
