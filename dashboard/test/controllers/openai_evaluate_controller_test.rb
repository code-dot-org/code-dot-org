require 'test_helper'

class OpenaiEvaluateControllerTest < ActionController::TestCase
  setup do
    @controller = OpenaiEvaluateController.new
  end

  test 'evaluate returns not found for bogus level",' do
    student = create(:student)
    sign_in(student)
    get :evaluate, params: {level_id: 18976, student_work: "This is a good answer.", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :not_found
  end

  # student did not attempt free response level
  test 'evaluate returns custom `no attempt` for empty free response",' do
    student = create(:student)
    sign_in(student)
    level = create(:free_response, :with_script)
    get :evaluate, params: {level_id: level.id, student_work: " ", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :ok
    custom_response = JSON.parse(json_response["content"])
    assert_equal custom_response["aiEvaluation"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED]
    assert_equal custom_response["aiReasoning"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NO_ATTEMPT]
  end

  # student response contains profanity
  test 'evaluate returns custom `Profanity detected` for free response with profanity",' do
    ProfanityFilter.stubs(:find_potential_profanity).returns 'shit'
    student = create(:student)
    sign_in(student)
    csp_course_offering = create(:csp_course_offering, :with_unit_group)
    unit = csp_course_offering.course_versions.first.content_root.first_unit
    level = create(:free_response)
    create(:script_level, script: unit, levels: [level])
    get :evaluate, params: {level_id: level.id, student_work: "This is shit.", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :ok
    custom_response = JSON.parse(json_response["content"])
    assert_equal custom_response["aiEvaluation"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED]
    assert_equal custom_response["aiReasoning"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:STUDENT_PROFANITY]
  end

  # student response contains PII
  test 'evaluate returns custom `PII detected` for free response with PII",' do
    ShareFiltering.stubs(:find_pii_failure).returns 'harry@hogwarts.edu'
    student = create(:student)
    sign_in(student)
    csp_course_offering = create(:csp_course_offering, :with_unit_group)
    unit = csp_course_offering.course_versions.first.content_root.first_unit
    level = create(:free_response)
    create(:script_level, script: unit, levels: [level])
    get :evaluate, params: {level_id: level.id, student_work: "My email is harry@hogwarts.edu", evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :ok
    custom_response = JSON.parse(json_response["content"])
    assert_equal custom_response["aiEvaluation"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED]
    assert_equal custom_response["aiReasoning"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:STUDENT_PII]
  end

  # student did not change starter code on programming level
  test 'evaluate returns custom `no attempt` for unchanged starter code on programming level",' do
    student = create(:student)
    sign_in(student)
    level = create(:applab, :with_script, :with_starter_code)
    get :evaluate, params: {level_id: level.id, student_work: level.get_starter_code, evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]}
    assert_response :ok
    custom_response = JSON.parse(json_response["content"])
    assert_equal custom_response["aiEvaluation"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED]
    assert_equal custom_response["aiReasoning"], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NO_ATTEMPT]
  end
end
