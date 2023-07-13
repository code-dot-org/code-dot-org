require 'test_helper'

class RubricTest < ActiveSupport::TestCase
  def setup
    @unit = create :unit
    @lesson = create :lesson, script: @unit
    @level = create :gamelab
    create :script_level, script: @unit, lesson: @lesson, levels: [@level]
  end

  def test_can_serialize_and_seed_rubric
    rubric = create :rubric, lesson: @lesson, level: @level
    serialization = rubric.serialize
    file_path = rubric.serialized_file_path
    rubric.destroy!

    File.stubs(:read).with(file_path).returns(serialization.to_json)

    Rubric.seed_record(file_path)

    created_rubric = Rubric.where(lesson_id: @lesson.id, level_id: @level.id).first
    refute_nil created_rubric
  end

  def test_can_serialize_and_seed_rubric_with_learning_goals
    rubric = create :rubric, lesson: @lesson, level: @level
    learning_goal1 = create :learning_goal, rubric: rubric, position: 0
    create :learning_goal_evidence_level, learning_goal: learning_goal1
    create :learning_goal_evidence_level, learning_goal: learning_goal1, understanding: 1
    learning_goal2 = create :learning_goal, rubric: rubric, position: 1
    create :learning_goal_evidence_level, learning_goal: learning_goal2

    serialization = rubric.serialize
    file_path = rubric.serialized_file_path
    rubric.destroy!

    File.stubs(:read).with(file_path).returns(serialization.to_json)

    Rubric.seed_record(file_path)

    created_rubric = Rubric.where(lesson_id: @lesson.id, level_id: @level.id).first
    refute_nil created_rubric

    assert_equal 2, created_rubric.learning_goals.count
    assert_equal 2, created_rubric.learning_goals.first.learning_goal_evidence_levels.count
    assert_equal 1, created_rubric.learning_goals.last.learning_goal_evidence_levels.count
  end
end
