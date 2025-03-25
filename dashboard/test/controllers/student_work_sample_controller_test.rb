require 'test_helper'

class StudentWorkSampleControllerTest < ActionController::TestCase
  setup do
    @controller = StudentWorkSampleController.new
  end

  # Anonymous, signed-out user cannot fetch student code samples,
  # expects redirect to sign in
  test_user_gets_response_for :fetch_student_code_samples,
  name: "no_user_no_access_test",
  user: nil,
  method: :get,
  params: {level_id: 123, script_id: 456, num_samples: 7},
  response: :redirect

  # Student cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "student_no_access_test",
  user: :student,
  method: :get,
  params: {level_id: 123, script_id: 456, num_samples: 7},
  response: :forbidden

  # Teacher cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "teacher_no_access_test",
  user: :teacher,
  method: :get,
  params: {level_id: 123, script_id: 456, num_samples: 7},
  response: :forbidden

  # Levelbuiilder cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "levelbuilder_no_access_test",
  user: :levelbuilder,
  method: :get,
  params: {level_id: 123, script_id: 456, num_samples: 7},
  response: :forbidden

  # AI Tutor Access cannot fetch student code samples
  test_user_gets_response_for :fetch_student_code_samples,
  name: "ai_tutor_permissions_no_access_test",
  user: :ai_tutor_access,
  method: :get,
  params: {level_id: 123, script_id: 456, num_samples: 7},
  response: :forbidden

  # AI Tutor Access + Levelbuilder can fetch student code samples
  # not found if bogus params
  test_user_gets_response_for :fetch_student_code_samples,
  name: "ai_iteration_tools_user_can_access_bogus_params",
  user: :ai_iteration_tools_user,
  method: :get,
  params: {level_id: 123, script_id: 456, num_samples: 7},
  response: :not_found

  # AI Tutor Access + Levelbuilder response ok if valid params
  test 'ai iteration tools user can access valid params",' do
    user = create(:ai_iteration_tools_user)
    sign_in(user)
    level = create(:level)
    script = create(:script)
    get :fetch_student_code_samples, params: {level_id: level.id, script_id: script.id, num_samples: 0}
    assert_response :ok
  end
end
