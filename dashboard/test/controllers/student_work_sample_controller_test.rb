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
  params: {level_id: 123, unit_id: 456},
  response: :redirect

  # Student cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "student_no_access_test",
  user: :student,
  method: :get,
  params: {level_id: 123, unit_id: 456},
  response: :forbidden

  # Teacher cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "teacher_no_access_test",
  user: :teacher,
  method: :get,
  params: {level_id: 123, unit_id: 456},
  response: :forbidden

  # Levelbuiilder cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "levelbuilder_no_access_test",
  user: :levelbuilder,
  method: :get,
  params: {level_id: 123, unit_id: 456},
  response: :forbidden

  # AI Tutor Access cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "ai_tutor_permissions_no_access_test",
  user: :ai_tutor_access,
  method: :get,
  params: {level_id: 123, unit_id: 456},
  response: :forbidden

  # Can fetch student code samples with student_work_access permission
  # not found if bogus params
  test_user_gets_response_for :fetch_student_code_samples,
  name: "student_work_dataset_maker_can_access_bogus_params",
  user: :student_work_dataset_maker,
  method: :get,
  params: {level_id: 123, unit_id: 456},
  response: :not_found

  # Can fetch student code samples with student_work_access permission
  # found if valid params
  test 'student_work_dataset_maker_can_access_valid_params' do
    user = create(:student_work_dataset_maker)
    sign_in(user)
    level = create(:level)
    unit = create(:script, :in_single_unit_course)
    get :fetch_student_code_samples, params: {level_id: level.id, unit_id: unit.id, student_ids: []}
    assert_response :ok
  end

  # Fetch a code sample
  test 'can fetch code sample' do
    dataset_maker = create(:student_work_dataset_maker)
    sign_in(dataset_maker)
    unit = create(:script, :in_single_unit_course)
    level = create(:level)
    student = create(:student)
    create(:user_level, user: student, level: level, script: unit)
    get :fetch_student_code_samples, params: {level_id: level.id, unit_id: unit.id, student_ids: [student.id]}
    assert_response :ok
    response_json = JSON.parse(response.body)
    assert response_json.first["studentWork"], 'console.log("Hello World")'
  end
end
