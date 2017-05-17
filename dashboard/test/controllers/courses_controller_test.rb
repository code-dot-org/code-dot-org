require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @teacher = create :teacher
    plc_course = create :plc_course, name: "My PLC"
    @course_plc = plc_course.course
    @course_regular = create :course, name: 'non plc course'
  end

  test "plc courses get sent to user_course_enrollments_controller" do
    sign_in @teacher

    get :show, params: {course_name: @course_plc.name}
    assert_template 'plc/user_course_enrollments/index'

    get :show, params: {course_name: 'my-plc'}
    assert_template 'plc/user_course_enrollments/index'
  end

  test "regular courses get sent to index" do
    sign_in @teacher

    get :show, params: {course_name: @course_regular.name}
    assert_template 'courses/show'

    get :show, params: {course_name: 'non-plc-course'}
    assert_template 'courses/show'
  end

  test "non exist course throws" do
    sign_in @teacher
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'nosuchcourse'}
    end
  end
end
