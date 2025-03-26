require 'test_helper'

class OpenaiEvaluateControllerTest < ActionController::TestCase
  setup do
    @controller = OpenaiEvaluateController.new
  end

  # level not found
  test 'evaluate returns not found for bogus level",' do
    student = create(:student)
    sign_in(student)
    unit = create(:script)
    get :evaluate, params: {level_id: 18976, unit_id: unit.id, student_work: "This is a good answer.", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :not_found
  end

  # # unit not found
  test 'evaluate returns not found for bogus unit",' do
    student = create(:student)
    sign_in(student)
    level = create(:level)
    get :evaluate, params: {level_id: level.id, unit_id: 9478, student_work: "This is a good answer.", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :not_found
  end

  # student did not attempt free response level
  test 'evaluate returns custom `no attempt` for empty free response",' do
    student = create(:student)
    sign_in(student)
    level = create(:free_response, :with_script)
    unit = level.script_levels.first.script
    get :evaluate, params: {level_id: level.id, unit_id: unit.id, student_work: " ", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :ok
    custom_response = JSON.parse(json_response["content"])
    assert_equal custom_response["aiEvaluation"], "No attempt"
    assert_equal custom_response["aiReasoning"], "The student response was blank."
  end

  # student did not change starter code on programming level
  test 'evaluate returns custom `no attempt` for unchanged starter code on programming level",' do
    student = create(:student)
    sign_in(student)
    level = create(:applab, :with_script, :with_starter_code)
    unit = level.script_levels.first.script
    get :evaluate, params: {level_id: level.id, unit_id: unit.id, student_work: level.get_starter_code, evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :ok
    custom_response = JSON.parse(json_response["content"])
    assert_equal custom_response["aiEvaluation"], "No attempt"
    assert_equal custom_response["aiReasoning"], "The student did not change the starter code."
  end
end
