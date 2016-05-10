require 'test_helper'

class Plc::EnrollmentModuleAssignmentTest < ActiveSupport::TestCase
  setup do
    course = create :plc_course
    course_unit = create(:plc_course_unit, plc_course: course)
    learning_module = create(:plc_learning_module, plc_course_unit: course_unit)
    create(:plc_script_completion_task, plc_learning_modules: [learning_module])
    create(:plc_script_completion_task, plc_learning_modules: [learning_module])

    user = create :teacher
    user_course_enrollment = create(:plc_user_course_enrollment, user: user, plc_course: course)
    @enrollment_unit_assignment = create(:plc_enrollment_unit_assignment, plc_user_course_enrollment: user_course_enrollment, plc_course_unit: course_unit)
    @enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules([learning_module])
    @enrollment_unit_assignment.reload
  end

  test 'test module status reporting' do
    module_assignment = @enrollment_unit_assignment.plc_module_assignments.first

    assert_equal Plc::EnrollmentModuleAssignment::NOT_STARTED, module_assignment.status
    module_assignment.plc_task_assignments.first.complete_assignment!
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, module_assignment.status
    module_assignment.plc_task_assignments.second.complete_assignment!
    assert_equal Plc::EnrollmentModuleAssignment::COMPLETED, module_assignment.status
  end
end
