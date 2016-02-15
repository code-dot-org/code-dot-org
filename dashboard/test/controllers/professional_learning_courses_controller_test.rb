require 'test_helper'

class ProfessionalLearningCoursesControllerTest < ActionController::TestCase
  setup do
    @professional_learning_course = create(:professional_learning_course)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:professional_learning_courses)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create professional_learning_course" do
    assert_difference('ProfessionalLearningCourse.count') do
      post :create, professional_learning_course: {professional_learning_course: @professional_learning_course}
    end

    assert_redirected_to professional_learning_course_path(assigns(:professional_learning_course))
  end

  test "should show professional_learning_course" do
    get :show, id: @professional_learning_course
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @professional_learning_course
    assert_response :success
  end

  test "should update professional_learning_course" do
    patch :update, id: @professional_learning_course, professional_learning_course: {  }
    assert_redirected_to professional_learning_course_path(assigns(:professional_learning_course))
  end

  test "should destroy professional_learning_course" do
    assert_difference('ProfessionalLearningCourse.count', -1) do
      delete :destroy, id: @professional_learning_course
    end

    assert_redirected_to professional_learning_courses_path
  end
end
