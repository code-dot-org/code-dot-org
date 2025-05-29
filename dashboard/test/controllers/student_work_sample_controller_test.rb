require 'test_helper'

class StudentWorkSampleControllerTest < ActionController::TestCase
  setup do
    @controller = StudentWorkSampleController.new
    Level.any_instance.stubs(:upper_grades_programming_level?).returns(true)
    @controller.stubs(:get_student_code).returns(
      {
        project_id: 123,
        code_version: "86754",
        student_code: 'console.log("Hello World")',
      }
    )
  end

  # Anonymous, signed-out user cannot fetch student code samples,
  # expects redirect to sign in
  test_user_gets_response_for :fetch_student_code_samples,
  name: "no_user_no_access_test",
  user: nil,
  method: :get,
  params: {level_id: 123, unit_id: 456, num_samples: 7},
  response: :redirect

  # Student cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "student_no_access_test",
  user: :student,
  method: :get,
  params: {level_id: 123, unit_id: 456, num_samples: 7},
  response: :forbidden

  # Teacher cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "teacher_no_access_test",
  user: :teacher,
  method: :get,
  params: {level_id: 123, unit_id: 456, num_samples: 7},
  response: :forbidden

  # Levelbuiilder cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "levelbuilder_no_access_test",
  user: :levelbuilder,
  method: :get,
  params: {level_id: 123, unit_id: 456, num_samples: 7},
  response: :forbidden

  # AI Tutor Access cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "ai_tutor_permissions_no_access_test",
  user: :ai_tutor_access,
  method: :get,
  params: {level_id: 123, unit_id: 456, num_samples: 7},
  response: :forbidden

  # Can fetch student code samples with student_work_access permission
  # not found if bogus params
  test_user_gets_response_for :fetch_student_code_samples,
  name: "student_work_dataset_maker_can_access_bogus_params",
  user: :student_work_dataset_maker,
  method: :get,
  params: {level_id: 123, unit_id: 456, num_samples: 7},
  response: :not_found

  # Can fetch student code samples with student_work_access permission
  # found if valid params
  test 'student_work_dataset_maker_can_access_valid_params' do
    user = create(:student_work_dataset_maker)
    sign_in(user)
    level = create(:level)
    unit = create(:script)
    get :fetch_student_code_samples, params: {level_id: level.id, unit_id: unit.id, num_samples: 0}
    assert_response :ok
  end

  # Fetch a code sample without evaluations
  test 'can fetch code sample without evaluations' do
    dataset_maker = create(:student_work_dataset_maker)
    sign_in(dataset_maker)
    level = create(:level)
    unit = create(:script)
    section = create(:section, script_id: unit.id)
    student = create(:student)
    create(:follower, section: section, student_user: student)
    get :fetch_student_code_samples, params: {level_id: level.id, unit_id: unit.id, num_samples: 1}
    assert_response :ok
    response_json = JSON.parse(response.body)
    assert response_json.first["student_code"], 'console.log("Hello World")'
  end

  # Asking for a code sample with evaluations when there are no evaluations returns not found
  test 'include ai_evaluations returns not found for un-evaluated level' do
    dataset_maker = create(:student_work_dataset_maker)
    sign_in(dataset_maker)
    level = create(:level)
    unit = create(:script)
    section = create(:section, script_id: unit.id)
    student = create(:student)
    create(:follower, section: section, student_user: student)
    get :fetch_student_code_samples, params: {level_id: level.id, unit_id: unit.id, num_samples: 1, include_ai_evaluations: true}
    assert_response :not_found
    assert @response.body, ("There are no skill-based evaluations for the level with id #{level.id}")
  end

  # Fetch evaluated code sample
  test 'can fetch code sample with evaluations' do
    dataset_maker = create(:student_work_dataset_maker)
    sign_in(dataset_maker)
    level = create(:level)
    unit = create(:script)
    section = create(:section, script_id: unit.id)
    student = create(:student)
    create(:follower, section: section, student_user: student)
    ulse = create(:user_level_skill_evaluation, student_id: student.id, level_id: level.id, unit_id: unit.id)
    ule = create(:user_level_evaluation, student_id: student.id, level_id: level.id, unit_id: unit.id)
    create(:student_work_evaluation_summary, student_work_evaluation_id: ulse.id, student_work_evaluation_summary_id: ule.id)
    get :fetch_student_code_samples, params: {level_id: level.id, unit_id: unit.id, num_samples: 1, include_ai_evaluations: true}
    assert_response :ok
    response_json = JSON.parse(response.body)
    assert response_json.first["student_code"], 'console.log("Hello World")'
    assert response_json.first["evaluation"], ule.evaluation
  end
end
