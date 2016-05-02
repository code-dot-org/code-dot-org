require 'test_helper'

class Plc::EnrollmentUnitAssignmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @learning_module1 = create(:plc_learning_module, plc_course_unit: @course_unit)
    @task1 = create(:plc_learning_resource_task, plc_learning_modules: [@learning_module1])
    @learning_module2 = create(:plc_learning_module, plc_course_unit: @course_unit)
    @task2 = create(:plc_written_submission_task, plc_learning_modules: [@learning_module2])
    create(:plc_learning_module, plc_course_unit: @course_unit)
    @required_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::REQUIRED_MODULE)
  end

  test 'Enrolling user in a course creates other assignment objects' do
    enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @teacher, plc_course: @course)
    unit_enrollment = Plc::EnrollmentUnitAssignment.create(plc_course_unit: @course_unit, plc_user_course_enrollment: enrollment,
                                                           status: Plc::EnrollmentUnitAssignment::START_BLOCKED)
    unit_enrollment.enroll_user_in_unit_with_learning_modules([@learning_module1, @learning_module2])
    unit_enrollment.reload
    module_assignments = unit_enrollment.plc_module_assignments
    task_assignments = unit_enrollment.plc_task_assignments

    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, unit_enrollment.status
    assert_equal 3, module_assignments.count
    assert_equal 2, task_assignments.count
    assert_equal @learning_module1, module_assignments.first.plc_learning_module
    assert_equal @task1, task_assignments.first.plc_task
    assert_equal @learning_module2, module_assignments.second.plc_learning_module
    assert_equal @task2, task_assignments.second.plc_task
    assert_equal @required_learning_module, module_assignments.third.plc_learning_module

    assert_equal Plc::WrittenEnrollmentTaskAssignment, task_assignments.second.class
  end
end
