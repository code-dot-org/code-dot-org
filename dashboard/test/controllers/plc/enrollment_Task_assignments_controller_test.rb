require 'test_helper'

class Plc::EnrollmentTaskAssignmentsControllerTest < ActionController::TestCase
  setup do
    @enrollment_task_assignment = create :plc_enrollment_task_assignment
    @user = create :admin
    sign_in(@user)
  end

  test "should get index" do
  end

  test "should update written enrollment task assignments" do

  end

  test "should show plc_user_course_enrollment" do
    get :show, id: @user_course_enrollment
    assert_response :success
  end

  test "should destroy plc_user_course_enrollment" do
    assert_difference('Plc::UserCourseEnrollment.count', -1) do
      delete :destroy, id: @user_course_enrollment
    end

    assert_redirected_to plc_user_course_enrollments_path
  end
end
