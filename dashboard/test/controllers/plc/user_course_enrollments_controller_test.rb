require 'test_helper'

class Plc::UserCourseEnrollmentsControllerTest < ActionController::TestCase
  setup do
    @user = create :admin
    sign_in(@user)
    @plc_course = create :plc_course
    @user_course_enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @plc_course)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:user_course_enrollments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create plc_user_course_enrollment" do
    assert_difference('Plc::UserCourseEnrollment.count') do
      post :create, user_email: @user.email, plc_course_id: @plc_course.id
    end

    assert_redirected_to plc_user_course_enrollment_path(assigns(:user_course_enrollment))
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
