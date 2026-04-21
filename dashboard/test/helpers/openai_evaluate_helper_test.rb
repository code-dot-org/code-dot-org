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

  test "evaluate_free_response calls evaluate" do
    fr_level_source = create(:level_source, data: "This is my free response answer")
    fr_user_level = create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: fr_level_source)

    OpenaiEvaluateHelper.expects(:evaluate).with(
      @free_response_level,
      student_work: "This is my free response answer",
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    ).returns({status: 200, json: {"content" => {
      aiEvaluation: "Meets",
      evaluationCriteria: "Did student answer the question?",
      aiReasoning: "Student provided a complete answer",
    }.to_json}}
)

    OpenaiEvaluateHelper.evaluate_free_response(fr_user_level, @unit)
  end

  test "evaluate_code_level with skills gets student code, calls evaluate and creates student work evaluation" do
    code_user_level = create(:user_level, user: @student1, level: @code_level1, script: @unit)

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
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT],
      should_evaluate_skills: true
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

    OpenaiEvaluateHelper.evaluate_code_level(code_user_level, @unit, true)
  end

  test "evaluate_section evaluates free response levels" do
    fr_level_source = create(:level_source, data: "This is my free response answer")
    fr_user_level = create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: fr_level_source)

    OpenaiEvaluateHelper.expects(:evaluate_free_response).with(
      fr_user_level,
      @unit,
    )

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section evaluates coding levels" do
    code_user_level = create(:user_level, user: @student1, level: @code_level1, script: @unit)

    OpenaiEvaluateHelper.expects(:evaluate_code_level).with(
      code_user_level,
      @unit,
      true
    )

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section skips levels with no level_source data" do
    level_source = create(:level_source, data: "")
    create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: level_source)

    OpenaiEvaluateHelper.expects(:evaluate_code_level).never
    OpenaiEvaluateHelper.expects(:evaluate_free_response).never

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_section skips non-targeted levels" do
    create(:user_level, user: @student1, level: @other_level, script: @unit)

    OpenaiEvaluateHelper.expects(:evaluate_code_level).never
    OpenaiEvaluateHelper.expects(:evaluate_free_response).never

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end

  test "evaluate_code_level handles nil student code" do
    nil_code_user_level = create(:user_level, user: @student1, level: @code_level2, script: @unit)

    helper = mock('helper')
    ApplicationController.expects(:helpers).returns(helper)
    helper.expects(:get_student_code).with(
      @student1.id,
      @code_level2,
      @unit.id
    ).returns(nil)

    OpenaiEvaluateHelper.expects(:evaluate).never

    OpenaiEvaluateHelper.evaluate_code_level(nil_code_user_level, @unit, false)
  end

  test "evaluate_section processes multiple students and levels" do
    level_source1 = create(:level_source, data: "Student 1 response")
    create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: level_source1)

    level_source2 = create(:level_source, data: "Student 2 response")
    create(:user_level, user: @student2, level: @free_response_level, script: @unit, level_source: level_source2)

    create(:user_level, user: @student1, level: @code_level1, script: @unit)

    OpenaiEvaluateHelper.expects(:evaluate_free_response).times(2).returns

    OpenaiEvaluateHelper.expects(:evaluate_code_level).times(1)

    OpenaiEvaluateHelper.evaluate_section(@unit, @section)
  end
end
