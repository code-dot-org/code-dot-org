require "test_helper"

class AidiffLessonHookTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @user = create(:user)
  end

  test 'exit ticket create no association' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    assert thread.aidiff_artifact.nil?

    lesson_hook = AidiffLessonHook.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json
    )

    assert_equal lesson_hook, thread.reload.aidiff_artifact
  end

  test 'exit ticket create course association' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    assert thread.aidiff_artifact.nil?

    course = create(:unit_group)

    lesson_hook = AidiffLessonHook.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    lesson_hook.aidiff_artifact_associations.create!(association_type: "course", unit_group: course)

    assert_equal lesson_hook, thread.reload.aidiff_artifact
    assert_equal "AidiffLessonHook", thread.reload.aidiff_artifact.type
    assert_equal 1, thread.aidiff_artifact.aidiff_artifact_associations.count
  end

  test 'exit ticket create section association' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    assert thread.aidiff_artifact.nil?

    section = create(:section)

    lesson_hook = AidiffLessonHook.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    lesson_hook.aidiff_artifact_associations.create!(association_type: "section", section: section)

    assert_equal lesson_hook, thread.reload.aidiff_artifact
    assert_equal "AidiffLessonHook", thread.reload.aidiff_artifact.type
    assert_equal 1, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 1, section.aidiff_artifact_associations.count
    assert_equal lesson_hook, section.reload.aidiff_artifacts.first
  end

  test 'exit ticket create multiple associations' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    assert thread.aidiff_artifact.nil?

    course1 = create(:unit_group)
    course2 = create(:unit_group)
    lesson1 = create(:lesson)
    lesson2 = create(:lesson)
    section = create(:section)

    lesson_hook = AidiffLessonHook.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    lesson_hook.aidiff_artifact_associations.create!(association_type: "section", section: section)
    lesson_hook.aidiff_artifact_associations.create!(association_type: "course", unit_group: course1)
    lesson_hook.aidiff_artifact_associations.create!(association_type: "course", unit_group_id: course2.id)
    lesson_hook.aidiff_artifact_associations.create!(association_type: "lesson", lesson: lesson1)
    lesson_hook.aidiff_artifact_associations.create!(association_type: "lesson", lesson_id: lesson2.id)

    assert_equal lesson_hook, thread.reload.aidiff_artifact
    assert_equal "AidiffLessonHook", thread.reload.aidiff_artifact.type
    assert_equal 5, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 1, section.aidiff_artifact_associations.count
    assert_equal lesson_hook, section.reload.aidiff_artifacts.first
  end

  test 'exit ticket create multiple artifact same section' do
    thread = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'Unit 3 differentiation thread',
      unit_id: 3,
      context_type: "unit"
    )

    assert thread.aidiff_artifact.nil?

    section = create(:section)

    lesson_hook = AidiffLessonHook.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    thread2 = AidiffThread.create!(
      user: @user,
      external_id: 'openai_1234',
      llm_version: 'chatgpt3.4.5',
      title: 'here is a title',
      unit_id: 3,
      context_type: "unit"
    )

    lesson_hook2 = AidiffLessonHook.create!(
      aidiff_thread: thread2,
      user: @user,
      title: "Another title",
      content: {blah: "lol"}.to_json,
    )

    lesson_hook.aidiff_artifact_associations.create!(association_type: "section", section: section)
    lesson_hook2.aidiff_artifact_associations.create!(association_type: "section", section: section)

    assert_equal lesson_hook, thread.reload.aidiff_artifact
    assert_equal lesson_hook2, thread2.reload.aidiff_artifact
    assert_equal "AidiffLessonHook", thread.reload.aidiff_artifact.type
    assert_equal "AidiffLessonHook", thread2.reload.aidiff_artifact.type
    assert_equal 1, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 1, thread2.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 2, section.aidiff_artifact_associations.count
    assert_equal lesson_hook, section.reload.aidiff_artifacts.first
    assert_equal lesson_hook2, section.reload.aidiff_artifacts.last
  end
end
