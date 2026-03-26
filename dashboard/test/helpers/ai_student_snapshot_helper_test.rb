require 'test_helper'

class AiStudentSnapshotHelperTest < ActiveSupport::TestCase
  setup do
    @unit = create(:unit, name: 'snapshot-helper-test-unit')
    @lesson_group = create(:lesson_group, script: @unit)
    @lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    @student = create(:student)
    @level = create(:level)
    create(:script_level, script: @unit, lesson: @lesson, levels: [@level])
  end

  # lesson_insight_stale? tests

  test "lesson_insight_stale? returns false when insight is less than 5 minutes old" do
    insight = stub(updated_at: 1.minute.ago)
    # Even if a UserLevel was updated after the insight, the 5-minute guard wins.
    create(:user_level, user: @student, script: @unit, level: @level,
      updated_at: 30.seconds.ago
    )
    refute AiStudentSnapshotHelper.lesson_insight_stale?(
      insight, @unit.id, @lesson.id, @student.id
    )
  end

  test "lesson_insight_stale? returns true when insight is older than 5 minutes and a UserLevel was updated after it" do
    insight_time = 10.minutes.ago
    insight = stub(updated_at: insight_time)
    create(:user_level, user: @student, script: @unit, level: @level,
      updated_at: 6.minutes.ago
    )
    assert AiStudentSnapshotHelper.lesson_insight_stale?(
      insight, @unit.id, @lesson.id, @student.id
    )
  end

  test "lesson_insight_stale? returns false when insight is older than 5 minutes but no UserLevel changed after it" do
    insight_time = 10.minutes.ago
    insight = stub(updated_at: insight_time)
    create(:user_level, user: @student, script: @unit, level: @level,
      updated_at: 15.minutes.ago
    )
    refute AiStudentSnapshotHelper.lesson_insight_stale?(
      insight, @unit.id, @lesson.id, @student.id
    )
  end

  test "lesson_insight_stale? returns false when insight is older than 5 minutes and student has no UserLevels" do
    insight = stub(updated_at: 10.minutes.ago)
    refute AiStudentSnapshotHelper.lesson_insight_stale?(
      insight, @unit.id, @lesson.id, @student.id
    )
  end

  test "lesson_insight_stale? returns false when only a UserLevel in a different lesson was updated recently" do
    insight = stub(updated_at: 10.minutes.ago)

    # A level that belongs to a different lesson in the same unit.
    other_lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    other_level = create(:level)
    create(:script_level, script: @unit, lesson: other_lesson, levels: [other_level])
    create(:user_level, user: @student, script: @unit, level: other_level,
      updated_at: 6.minutes.ago
    )

    refute AiStudentSnapshotHelper.lesson_insight_stale?(
      insight, @unit.id, @lesson.id, @student.id
    )
  end
end
