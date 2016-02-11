require 'test_helper'

class UserModuleTaskAssignmentTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @plc = create :professional_learning_course
    @learning_module1 = create(:professional_learning_module, name: 'Module1')
    @learning_module2 = create(:professional_learning_module, name: 'Module2')
    @task1 = create(:professional_learning_task, name: 'Task1', professional_learning_module: @learning_module1)
    @task2 = create(:professional_learning_task, name: 'Task2', professional_learning_module: @learning_module1)
    @task3 = create(:professional_learning_task, name: 'Task3', professional_learning_module: @learning_module2)
  end

  test 'Completing tasks does not mark module / course complete until all are complete' do
    enrollment = UserProfessionalLearningCourseEnrollment.enroll_user_in_course_with_learning_modules(@user, @plc, [@learning_module1, @learning_module2])
    task_assignments = enrollment.user_module_task_assignment

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
