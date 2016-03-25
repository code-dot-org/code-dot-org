require 'test_helper'

class Plc::EnrollmentUnitAssignmentsControllerTest < ActionController::TestCase
  setup do
    @plc_enrollment_unit_assignment = plc_enrollment_unit_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:plc_enrollment_unit_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create plc_enrollment_unit_assignment" do
    assert_difference('Plc::EnrollmentUnitAssignment.count') do
      post :create, plc_enrollment_unit_assignment: { plc_course_unit_id: @plc_enrollment_unit_assignment.plc_course_unit_id, plc_user_course_enrollment_id: @plc_enrollment_unit_assignment.plc_user_course_enrollment_id, status: @plc_enrollment_unit_assignment.status }
    end

    assert_redirected_to plc_enrollment_unit_assignment_path(assigns(:plc_enrollment_unit_assignment))
  end

  test "should show plc_enrollment_unit_assignment" do
    get :show, id: @plc_enrollment_unit_assignment
    assert_response :success
  end

  test "should destroy plc_enrollment_unit_assignment" do
    assert_difference('Plc::EnrollmentUnitAssignment.count', -1) do
      delete :destroy, id: @plc_enrollment_unit_assignment
    end

    assert_redirected_to plc_enrollment_unit_assignments_path
  end
end
