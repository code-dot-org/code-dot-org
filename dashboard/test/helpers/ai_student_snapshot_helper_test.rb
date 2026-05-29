require 'test_helper'

class AiStudentSnapshotHelperTest < ActiveSupport::TestCase
  setup do
    @student = create(:student)
    @unit = create(:unit)
    @lesson_group = create(:lesson_group, script: @unit)
    @lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    @level = create(:level)
    create(:script_level, script: @unit, lesson: @lesson, levels: [@level])
  end

  # ---------------------------------------------------------------------------
  # max_user_level_updated_at
  # ---------------------------------------------------------------------------

  test 'max_user_level_updated_at returns nil when student has no user levels in the lesson' do
    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_nil result
  end

  test 'max_user_level_updated_at returns the updated_at of the student user level' do
    timestamp = 7.minutes.ago
    user_level = create(:user_level, user: @student, script: @unit, level: @level, updated_at: timestamp)

    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_equal user_level.updated_at, result
  end

  test 'max_user_level_updated_at returns the maximum across multiple user levels in the lesson' do
    level2 = create(:level)
    create(:script_level, script: @unit, lesson: @lesson, levels: [level2])

    older_timestamp = 20.minutes.ago
    newer_timestamp = 5.minutes.ago
    create(:user_level, user: @student, script: @unit, level: @level, updated_at: older_timestamp)
    newer_user_level = create(:user_level, user: @student, script: @unit, level: level2, updated_at: newer_timestamp)

    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_equal newer_user_level.updated_at, result
  end

  test 'max_user_level_updated_at ignores user levels from other lessons' do
    other_lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    other_level = create(:level)
    create(:script_level, script: @unit, lesson: other_lesson, levels: [other_level])
    create(:user_level, user: @student, script: @unit, level: other_level, updated_at: 3.minutes.ago)

    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_nil result
  end

  # ---------------------------------------------------------------------------
  # should_generate_lesson_insight?
  # ---------------------------------------------------------------------------

  test 'returns true when insight is nil' do
    assert AiStudentSnapshotHelper.should_generate_lesson_insight?(nil, @unit.id, @lesson.id, @student.id)
  end

  test 'returns false when insight was updated within the cooldown window' do
    insight = build(:lesson_insight, updated_at: 1.minute.ago)
    refute AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  test 'returns false when insight is older than cooldown but no user levels exist' do
    insight = build(:lesson_insight, updated_at: 10.minutes.ago)
    refute AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  test 'returns false when insight is older than cooldown but no user level is newer than insight' do
    insight = build(:lesson_insight, updated_at: 10.minutes.ago)
    create(:user_level, user: @student, script: @unit, level: @level, updated_at: 15.minutes.ago)
    refute AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  test 'returns true when a user level was updated after the insight' do
    insight = build(:lesson_insight, updated_at: 10.minutes.ago)
    create(:user_level, user: @student, script: @unit, level: @level, updated_at: 6.minutes.ago)
    assert AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end
end
