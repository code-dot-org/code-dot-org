require 'test_helper'

class StudentWorkEvaluationsControllerTest < ActionController::TestCase
  include LevelsHelper
  setup do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
    @unit = create(:csp_script, :with_levels)
    @unit_group = create(:single_unit_course, name: 'csp-2024', family_name: 'csp', version_year: '2024', unit: @unit)
    CourseOffering.add_course_offering(@unit_group)
    @level = @unit.levels.first
    @skill = create(:skill)
    create(:levels_skill, level: @level, skill: @skill)
    @ule_params = {
      type: 'UserLevelEvaluation',
      level_id: @level.id,
      unit_id: @unit.id,
      student_id: @student.id,
      evaluator: "AI",
      evaluation_criteria: 'Did the student answer the question?',
      evaluation: 'Great',
      reasoning: 'The student answered all parts of the question correctly.',
      ai_model_version: 'robots-1.0',
    }
    @ulse_params = {
      type: 'UserLevelSkillEvaluation',
      level_id: @level.id,
      unit_id: @unit.id,
      student_id: @student.id,
      skill_id: @skill.id,
      evaluator: "AI",
      evaluation_criteria: 'Did the student declare a variable correctly?',
      evaluation: 'Needs revision',
      reasoning: 'The student declared a variable, but did not follow naming conventions.',
      ai_model_version: 'robots-1.0',
    }
  end

  test "Student can create their own UserLevelEvaluation" do
    sign_in @student
    assert_creates(UserLevelEvaluation) do
      post :create, params: @ule_params
    end
    created_swe = StudentWorkEvaluation.last
    assert_equal created_swe.type, "UserLevelEvaluation"
    assert_equal created_swe.requester_id, @student.id
  end

  test "Teacher can create UserLevelEvaluation for student in their section" do
    sign_in @teacher
    assert_creates(UserLevelEvaluation) do
      post :create, params: @ule_params
    end
    created_swe = StudentWorkEvaluation.last
    assert_equal created_swe.type, "UserLevelEvaluation"
    assert_equal created_swe.requester_id, @teacher.id
  end

  test "Student can create their own UserLevelSkillEvaluation" do
    sign_in @student
    assert_creates(UserLevelSkillEvaluation) do
      post :create, params: @ulse_params
    end
    created_swe = StudentWorkEvaluation.last
    assert_equal created_swe.type, "UserLevelSkillEvaluation"
    assert_equal created_swe.requester_id, @student.id
  end

  test "Teacher can create UserLevelSkillEvaluation for student in their section" do
    sign_in @teacher
    assert_creates(UserLevelSkillEvaluation) do
      post :create, params: @ulse_params
    end
    created_swe = StudentWorkEvaluation.last
    assert_equal created_swe.type, "UserLevelSkillEvaluation"
    assert_equal created_swe.requester_id, @teacher.id
  end
end
