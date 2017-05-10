require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @teacher = create :teacher
    sign_in @teacher

    plc_course = create :plc_course
    @course_plc = plc_course.course
    # avoid creation validation of name
    @course_plc.name = "My PLC"
    @course_plc.save(validate: false)
    @course_regular = create :course, name: 'non_plc_course'
  end

  test "plc courses get sent to user_course_enrollments_controller" do
    get :show, params: {course_name: @course_plc.name}
    assert_template 'plc/user_course_enrollments/index'
  end

  test "plc course names get titleized" do
    get :show, params: {course_name: 'my-plc'}
    assert_template 'plc/user_course_enrollments/index'
  end

  test "regular courses get sent to index" do
    get :show, params: {course_name: @course_regular.name}
    assert_template 'courses/course_overview'
  end

  test "regular courses do not get titlized" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'non-plc-course'}
    end
  end

  test "non existant course throws" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'nosuchcourse'}
    end
  end
end
