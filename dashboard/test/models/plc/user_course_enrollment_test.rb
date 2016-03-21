require 'test_helper'

class Plc::UserCourseEnrollmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @plc_course = create :plc_course
    @learning_module1 = create :plc_learning_module
    @plc_task1 = create(:plc_learning_resource_task, plc_learning_module: @learning_module1)
    @learning_module2 = create :plc_learning_module
    @plc_task2 = create(:plc_written_submission_task, plc_learning_module: @learning_module2)
  end

  test 'Enrolling user in a course creates other assignment objects' do
    enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @teacher, plc_course: @plc_course)
    enrollment.enroll_user_in_course_with_learning_modules([@learning_module1, @learning_module2])
    enrollment.reload
    module_assignments = enrollment.plc_module_assignments
    task_assignments = enrollment.plc_task_assignments

    assert_equal 2, module_assignments.count
    assert_equal 2, task_assignments.count
    assert_equal @learning_module1, module_assignments.first.plc_learning_module
    assert_equal @plc_task1, task_assignments.first.plc_task
    assert_equal @learning_module2, module_assignments.second.plc_learning_module
    assert_equal @plc_task2, task_assignments.second.plc_task

    assert_equal Plc::WrittenEnrollmentTaskAssignment, task_assignments.second.class
  end

end
