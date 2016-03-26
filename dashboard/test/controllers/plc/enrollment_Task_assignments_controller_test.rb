require 'test_helper'

class Plc::EnrollmentTaskAssignmentsControllerTest < ActionController::TestCase
  setup do
    @user = create :admin
    sign_in(@user)

    course = create :plc_course
    course_unit = create(:plc_course_unit, plc_course: course)
    learning_module = create :plc_learning_module
    task = create(:plc_script_completion_task, plc_learning_module: learning_module)
    written_task = create(:plc_written_submission_task, plc_learning_module: learning_module)

    user_course_enrollment = create(:plc_user_course_enrollment, plc_course: course, user: @user)
    enrollment_unit_assignment = create(:plc_enrollment_unit_assignment, plc_user_course_enrollment: user_course_enrollment, plc_course_unit: course_unit)
    enrollment_module_assignment = create(:plc_enrollment_module_assignment, plc_learning_module: learning_module, plc_enrollment_unit_assignment: enrollment_unit_assignment)
    @enrollment_task_assignment = create(:plc_enrollment_task_assignment, plc_enrollment_module_assignment: enrollment_module_assignment, plc_task: task)
    @written_task_assignment = create(:written_enrollment_task_assignment, plc_enrollment_module_assignment: enrollment_module_assignment, plc_task: written_task)
  end

  test 'should get index' do
    get :index
    assert_response :success
  end

  test 'should show plc_user_course_enrollment' do
    get :show, id: @enrollment_task_assignment
    assert_response :success
  end

  test 'should update written enrollment task assignments' do
    assert_nil @written_task_assignment.submission

    patch :update, id: @written_task_assignment, plc_written_enrollment_task_assignment: {submission: 'Some submission'}

    @written_task_assignment.reload
    assert_equal 'Some submission', @written_task_assignment.submission
  end

  test 'should destroy enrollment task assignment' do
    assert_difference('Plc::EnrollmentTaskAssignment.count', -1) do
      delete :destroy, id: @enrollment_task_assignment
    end

    assert_redirected_to plc_enrollment_task_assignments_path
  end
end
