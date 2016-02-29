require 'test_helper'

class Plc::UserCourseEnrollmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @plc_course = create :plc_course
    @learning_module = create :plc_learning_module
    @plc_task = create(:plc_task, plc_learning_module: @learning_module)
  end

  test 'Enrolling user in a course creates other assignment objects' do
    enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @teacher, plc_course: @plc_course)
    enrollment.enroll_user_in_course_with_learning_modules([@learning_module])
    enrollment.reload
    module_assignments = enrollment.plc_module_assignments
    task_assignments = enrollment.plc_task_assignments

    assert_equal 1, module_assignments.count
    assert_equal 1, task_assignments.count
    assert_equal @learning_module, module_assignments.first.plc_learning_module
    assert_equal @plc_task, task_assignments.first.plc_task
  end
end
