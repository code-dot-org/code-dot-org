require 'test_helper'

class Plc::EnrollmentTaskAssignmentTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @learning_module1 = create(:plc_learning_module, name: 'Module1')
    @learning_module2 = create(:plc_learning_module, name: 'Module2')
    @task1 = create(:plc_task, name: 'Task1', plc_learning_module: @learning_module1)
    @task2 = create(:plc_task, name: 'Task2', plc_learning_module: @learning_module1)
    @task3 = create(:plc_task, name: 'Task3', plc_learning_module: @learning_module2)
  end

  test 'Completing tasks does not mark module / course complete until all are complete' do
    enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @user, plc_course: @course)
    unit_enrollment = Plc::EnrollmentUnitAssignment.create(plc_user_course_enrollment: enrollment, plc_course_unit: @course_unit,
                                                           status: Plc::EnrollmentUnitAssignment::START_BLOCKED)

    assert_equal Plc::EnrollmentUnitAssignment::START_BLOCKED, unit_enrollment.status
    unit_enrollment.enroll_user_in_unit_with_learning_modules([@learning_module1, @learning_module2])
    task_assignments = enrollment.plc_task_assignments

    assert_not_equal :completed, unit_enrollment.status
    assert_empty task_assignments.where(status: :completed).all

    task_assignments.first.complete_assignment!
    assert_equal 'completed', task_assignments.first.status
    unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, unit_enrollment.status

    task_assignments.second.complete_assignment!
    assert_equal 'completed', task_assignments.second.status
    unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, unit_enrollment.status

    task_assignments.third.complete_assignment!
    assert_equal 'completed', task_assignments.third.status
    unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::COMPLETED, unit_enrollment.status
  end
end
