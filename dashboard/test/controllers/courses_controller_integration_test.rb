require 'test_helper'

class CoursesControllerTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true

  test "show: plc courses get sent to user_course_enrollments_controller" do
    sign_in create :teacher
    # Note: We intentionally use a complex-ish course name here, similar to what
    # our real PLC course names look like.
    plc_course = create :plc_course, name: "CS Discoveries Deeper Learning 2119 - 2120"
    get course_path(plc_course.course)
    assert_template 'plc/user_course_enrollments/index'
  end

  # We'd like to deprecate this behavior as soon as we're confident nothing depends on it
  test "show: plc course names get titleized" do
    sign_in create :teacher
    create :plc_course, name: "My Plc"
    get '/courses/my_plc'
    assert_template 'plc/user_course_enrollments/index'
  end
end
