require 'test_helper'

class OpenaiEvaluateHelperTest < ActionView::TestCase
  include OpenaiEvaluateHelper

  setup do
    @section = create(:section)
    @student1 = create(:student)
    @student2 = create(:student)
    @section.add_student(@student1)
    @section.add_student(@student2)

    @unit = create(:script, :with_levels, levels_count: 4)
    @free_response_level = @unit.script_levels.first.level
    @code_level1 = @unit.script_levels.second.level
    Level.find_by(id: @code_level1.id).update!(name: 'U4 L03 Variables operator practice 5_2024')
    @code_level2 = @unit.script_levels.third.level
    Level.find_by(id: @code_level2.id).update!(name: 'U4 L03 Variables numbers practice 4_2024')
    @other_level = @unit.script_levels.fourth.level
    Level.find_by(id: @other_level.id).update!(name: 'Some other level')
  end

  test "evaluate_section evaluates free response levels" do
    level_source = create(:level_source, data: "This is my free response answer")
    create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: level_source)

    mock_response = {
      status: :ok,
      json: {"content" => {
        aiEvaluation: "Meets",
        evaluationCriteria: "Did student answer the question?",
        aiReasoning: "Student provided a complete answer",
        skillEvaluations: []
      }.to_json}
    }

    OpenaiEvaluateHelper.expects(:evaluate).with(
      @free_response_level,
      student_work: "This is my free response answer",
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    ).returns(mock_response)

    StudentWorkEvaluation.expects(:create!).with(
      has_entry(type: 'UserLevelEvaluation')
    ).returns(mock('work_evaluation'))

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section evaluates specific code levels with skill evaluation" do
    create(:user_level, user: @student1, level: @code_level1, script: @unit)

    helper = mock('helper')
    ApplicationController.expects(:helpers).returns(helper)
    helper.expects(:get_student_code).with(
      @student1.id,
      @code_level1,
      @unit.id
    ).returns({student_code: "console.log('Hello')", code_version: "1"})

    mock_response = {
      status: :ok,
      json: {"content" => {
        aiEvaluation: "Meets",
        evaluationCriteria: "Did student write correct code?",
        aiReasoning: "Student code is correct",
        skillEvaluations: [
          {
            skillId: "skill1",
            aiEvaluation: "Meets",
            evaluationCriteria: "Skill criteria",
            aiReasoning: "Skill reasoning"
          }
        ]
      }.to_json}
    }

    OpenaiEvaluateHelper.expects(:evaluate).with(
      @code_level1,
      student_work: "console.log('Hello')",
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    ).returns(mock_response)

    work_evaluation = mock('work_evaluation')
    work_evaluation.stubs(:id).returns(1)
    StudentWorkEvaluation.expects(:create!).returns(work_evaluation)

    skill_evaluation = mock('skill_evaluation')
    skill_evaluation.expects(:id).returns(2)
    StudentWorkEvaluation.expects(:create!).with(
      has_entry(type: 'UserLevelSkillEvaluation')
    ).returns(skill_evaluation)

    StudentWorkEvaluationSummary.expects(:create!).with(
      student_work_evaluation_id: 2,
      student_work_evaluation_summary_id: 1
    ).returns(mock('summary'))

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section skips levels with no level_source data" do
    level_source = create(:level_source, data: "")
    create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: level_source)

    OpenaiEvaluateHelper.expects(:evaluate).never

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section skips non-targeted levels" do
    create(:user_level, user: @student1, level: @other_level, script: @unit)

    ApplicationController.helpers.expects(:get_student_code).never
    OpenaiEvaluateHelper.expects(:evaluate).never

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section handles nil student code" do
    create(:user_level, user: @student1, level: @code_level2, script: @unit)

    helper = mock('helper')
    ApplicationController.expects(:helpers).returns(helper)
    helper.expects(:get_student_code).with(
      @student1.id,
      @code_level2,
      @unit.id
    ).returns(nil)

    OpenaiEvaluateHelper.expects(:evaluate).never

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section processes multiple students and levels" do
    level_source1 = create(:level_source, data: "Student 1 response")
    create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: level_source1)

    level_source2 = create(:level_source, data: "Student 2 response")
    create(:user_level, user: @student2, level: @free_response_level, script: @unit, level_source: level_source2)

    create(:user_level, user: @student1, level: @code_level1, script: @unit)

    helper = mock('helper')
    ApplicationController.expects(:helpers).at_least_once.returns(helper)
    helper.expects(:get_student_code).with(
      @student1.id,
      @code_level1,
      @unit.id
    ).returns({student_code: "console.log('Hello')", code_version: "1"})

    mock_response = {
      status: :ok,
      json: {"content" => {
        aiEvaluation: "Meets",
        evaluationCriteria: "Test criteria",
        aiReasoning: "Test reasoning",
        skillEvaluations: []
      }.to_json}
    }

    OpenaiEvaluateHelper.expects(:evaluate).times(3).returns(mock_response)

    work_evaluation = mock('work_evaluation')
    work_evaluation.stubs(:id).returns(1)
    StudentWorkEvaluation.expects(:create!).times(3).returns(work_evaluation)

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end
end
