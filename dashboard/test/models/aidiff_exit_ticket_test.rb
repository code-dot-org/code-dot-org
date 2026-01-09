require "test_helper"

class AidiffExitTicketTest < ActiveSupport::TestCase
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

    exit_ticket = AidiffExitTicket.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json
    )

    assert_equal exit_ticket, thread.reload.aidiff_artifact
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

    exit_ticket = AidiffExitTicket.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    exit_ticket.aidiff_artifact_associations.create!(association_type: "course", unit_group: course)

    assert_equal exit_ticket, thread.reload.aidiff_artifact
    assert_equal "AidiffExitTicket", thread.reload.aidiff_artifact.type
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

    exit_ticket = AidiffExitTicket.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    exit_ticket.aidiff_artifact_associations.create!(association_type: "section", section: section)

    assert_equal exit_ticket, thread.reload.aidiff_artifact
    assert_equal "AidiffExitTicket", thread.reload.aidiff_artifact.type
    assert_equal 1, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 1, section.aidiff_artifact_associations.count
    assert_equal exit_ticket, section.reload.aidiff_artifacts.first
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

    exit_ticket = AidiffExitTicket.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    exit_ticket.aidiff_artifact_associations.create!(association_type: "section", section: section)
    exit_ticket.aidiff_artifact_associations.create!(association_type: "course", unit_group: course1)
    exit_ticket.aidiff_artifact_associations.create!(association_type: "course", unit_group_id: course2.id)
    exit_ticket.aidiff_artifact_associations.create!(association_type: "lesson", lesson: lesson1)
    exit_ticket.aidiff_artifact_associations.create!(association_type: "lesson", lesson_id: lesson2.id)

    assert_equal exit_ticket, thread.reload.aidiff_artifact
    assert_equal "AidiffExitTicket", thread.reload.aidiff_artifact.type
    assert_equal 5, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 1, section.aidiff_artifact_associations.count
    assert_equal exit_ticket, section.reload.aidiff_artifacts.first
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

    exit_ticket = AidiffExitTicket.create!(
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

    exit_ticket2 = AidiffExitTicket.create!(
      aidiff_thread: thread2,
      user: @user,
      title: "Another title",
      content: {blah: "lol"}.to_json,
    )

    exit_ticket.aidiff_artifact_associations.create!(association_type: "section", section: section)
    exit_ticket2.aidiff_artifact_associations.create!(association_type: "section", section: section)

    assert_equal exit_ticket, thread.reload.aidiff_artifact
    assert_equal exit_ticket2, thread2.reload.aidiff_artifact
    assert_equal "AidiffExitTicket", thread.reload.aidiff_artifact.type
    assert_equal "AidiffExitTicket", thread2.reload.aidiff_artifact.type
    assert_equal 1, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 1, thread2.aidiff_artifact.aidiff_artifact_associations.count
    assert_equal 2, section.aidiff_artifact_associations.count
    assert_equal exit_ticket, section.reload.aidiff_artifacts.first
    assert_equal exit_ticket2, section.reload.aidiff_artifacts.last
  end

  test 'exit ticket create course association and get course_id' do
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

    exit_ticket = AidiffExitTicket.create!(
      aidiff_thread: thread,
      user: @user,
      title: "A cool title",
      content: {stuff: "things"}.to_json,
    )

    exit_ticket.aidiff_artifact_associations.create!(association_type: "course", unit_group: course)

    assert_equal exit_ticket, thread.reload.aidiff_artifact
    assert_equal "AidiffExitTicket", thread.reload.aidiff_artifact.type
    assert_equal 1, thread.aidiff_artifact.aidiff_artifact_associations.count
    assert_includes thread.aidiff_artifact.unit_groups, course
    assert_includes thread.aidiff_artifact.unit_group_ids, course.id
  end
end
