require 'test_helper'

class Plc::EnrollmentTaskAssignmentTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @learning_module1 = create(:plc_learning_module, name: 'Module1', plc_course_unit: @course_unit)
    @learning_module2 = create(:plc_learning_module, name: 'Module2', plc_course_unit: @course_unit)
    @task1 = create(:plc_task, name: 'Task1', plc_learning_modules: [@learning_module1])
    @task2 = create(:plc_task, name: 'Task2', plc_learning_modules: [@learning_module1])
    @task3 = create(:plc_task, name: 'Task3', plc_learning_modules: [@learning_module2])
    @enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @user, plc_course: @course)
    @unit_enrollment = Plc::EnrollmentUnitAssignment.create(
        plc_user_course_enrollment: @enrollment,
        plc_course_unit: @course_unit,
        status: Plc::EnrollmentUnitAssignment::PENDING_EVALUATION
    )
  end

  test 'Completing tasks does not mark module / course complete until all are complete' do
    assert_equal Plc::EnrollmentUnitAssignment::PENDING_EVALUATION, @unit_enrollment.status
    @unit_enrollment.enroll_user_in_unit_with_learning_modules([@learning_module1, @learning_module2])
    task_assignments = @enrollment.plc_task_assignments

    assert_not_equal :completed, @unit_enrollment.status
    assert_empty task_assignments.where(status: :completed).all

    task_assignments.first.complete_assignment!
    assert_equal 'completed', task_assignments.first.status
    @unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, @unit_enrollment.status

    task_assignments.second.complete_assignment!
    assert_equal 'completed', task_assignments.second.status
    @unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, @unit_enrollment.status

    task_assignments.third.complete_assignment!
    assert_equal 'completed', task_assignments.third.status
    @unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::COMPLETED, @unit_enrollment.status
  end

  test 'assert_icon_style_for_tasks' do
    learning_module = create(:plc_learning_module, plc_course_unit: @course_unit)

    script_completion_task = create(:plc_script_completion_task, plc_learning_modules: [learning_module])
    learning_resource_task = create(:plc_learning_resource_task, icon: 'some icon', plc_learning_modules: [learning_module])

    @unit_enrollment.enroll_user_in_unit_with_learning_modules([learning_module])

    learning_resource_task_assignment = @unit_enrollment.plc_task_assignments.where(plc_task: learning_resource_task).first
    script_completion_task_assignment =  @unit_enrollment.plc_task_assignments.where(plc_task: script_completion_task).first

    expected_icon_style_map = {
      learning_resource_task_assignment => Plc::EnrollmentTaskAssignment::TASK_STATUS_STATES.map{ |status| [status, {icon: 'some icon', style: ''}] }.to_h,
      script_completion_task_assignment => {
        Plc::EnrollmentTaskAssignment::NOT_STARTED => {icon: 'fa-circle-o', style: 'color: black'},
        Plc::EnrollmentTaskAssignment::IN_PROGRESS => {icon: 'fa-adjust', style: 'color: darkgoldenrod'},
        Plc::EnrollmentTaskAssignment::COMPLETED => {icon: 'fa-check-circle', style: 'color: green'},
      }
    }

    expected_icon_style_map.each do |assignment, style_map|
      style_map.each do |status, styling|
        assignment.update!(status: status)
        icon, style = assignment.get_icon_and_style
        assert_equal styling[:icon], icon
        assert_equal styling[:style], style
      end
    end

  end
end
