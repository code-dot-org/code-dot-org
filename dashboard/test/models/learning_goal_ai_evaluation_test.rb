require 'test_helper'

class LearningGoalAiEvaluationTest < ActiveSupport::TestCase
  setup do
    @student = create :student
    @student.update!(username: 'evalstudent')

    @script = create :script, name: 'rubric-unit'
    @lesson = create :lesson, :with_lesson_group, absolute_position: 33, relative_position: 22, script: @script
    @level = create :level, name: 'rubric level'
    @script_level = create :script_level, script: @script, lesson: @lesson, levels: [@level]

    @rubric = create :rubric, lesson: @lesson, level: @level
    @learning_goal = create :learning_goal, rubric: @rubric, learning_goal: 'evaluated learning goal'
  end

  test 'summarize_debug' do
    rubric_ai_evaluation = create(
      :rubric_ai_evaluation,
      rubric: @rubric,
      user: @student,
      requester: @student,
    )

    eval = create(
      :learning_goal_ai_evaluation,
      rubric_ai_evaluation: rubric_ai_evaluation,
      learning_goal: @learning_goal,
      understanding: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.CONVINCING,
      ai_confidence: LearningGoalAiEvaluation::AI_CONFIDENCE_LEVELS[:MEDIUM],
    )
    summary = eval.summarize_debug

    assert_equal eval.id, summary[:id]
    assert_equal @student.id, summary[:user_id]
    assert_equal @script_level.id, summary[:script_level_id]
    assert_equal 'evalstudent', summary[:username]
    assert_equal 'evalstudent', summary[:requester_username]
    assert_equal 'rubric-unit', summary[:unit_name]
    assert_equal 33, summary[:lesson_position]
    assert_equal 'rubric level', summary[:level_name]
    assert_equal 'evaluated learning goal', summary[:learning_goal]
    assert_equal 'CONVINCING', summary[:understanding]
    assert_equal 'MEDIUM', summary[:ai_confidence]
  end
end
