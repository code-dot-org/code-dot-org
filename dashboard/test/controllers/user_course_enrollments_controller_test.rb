require 'test_helper'

class UserCourseEnrollmentsControllerTest < ActionController::TestCase
  setup do
    @user = create :teacher
    @professional_learning_course = create :professional_learning_course
    @user_course_enrollment = create(:user_professional_learning_course_enrollment, user: @user, professional_learning_course: @professional_learning_course)
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

  test "should create user_course_enrollment" do
    assert_difference('UserCourseEnrollment.count') do
      post :create, user_course_enrollment: { name: 'TestName'  }
    end

    assert_redirected_to user_course_enrollment_path(assigns(:user_course_enrollment))
  end

  test "should show user_course_enrollment" do
    get :show, id: @user_course_enrollment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @user_course_enrollment
    assert_response :success
  end

  test "should update user_course_enrollment" do
    patch :update, id: @user_course_enrollment, user_course_enrollment: { name: 'TestName'  }
    assert_redirected_to user_course_enrollment_path(assigns(:user_course_enrollment))
  end

  test "should destroy user_course_enrollment" do
    assert_difference('UserCourseEnrollment.count', -1) do
      delete :destroy, id: @user_course_enrollment
    end

    assert_redirected_to user_course_enrollments_path
  end
end
