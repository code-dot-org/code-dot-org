require 'test_helper'

class Plc::EnrollmentTaskAssignmentTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @plc = create :plc_course
    @learning_module1 = create(:plc_learning_module, name: 'Module1')
    @learning_module2 = create(:plc_learning_module, name: 'Module2')
    @task1 = create(:plc_task, name: 'Task1', plc_learning_module: @learning_module1)
    @task2 = create(:plc_task, name: 'Task2', plc_learning_module: @learning_module1)
    @task3 = create(:plc_task, name: 'Task3', plc_learning_module: @learning_module2)
  end

  test 'Completing tasks does not mark module / course complete until all are complete' do
    enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @user, plc_course: @plc)
    enrollment.enroll_user_in_course_with_learning_modules([@learning_module1, @learning_module2])
    task_assignments = enrollment.task_assignments

    assert_not_equal :completed, enrollment.status
    assert_empty task_assignments.where(status: :completed).all

    task_assignments.first.complete_assignment
    assert_equal 'completed', task_assignments.first.status
    enrollment.reload
    assert_not_equal 'completed ', enrollment.status

    task_assignments.second.complete_assignment
    assert_equal 'completed', task_assignments.second.status
    enrollment.reload
    assert_not_equal 'completed', enrollment.status

    task_assignments.third.complete_assignment
    assert_equal 'completed', task_assignments.third.status
    enrollment.reload
    assert_equal 'completed', enrollment.status
  end
end
