require 'test_helper'

class Plc::EnrollmentUnitAssignmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @learning_module1 = create(:plc_learning_module, plc_course_unit: @course_unit)
    @task1 = create(:plc_task, plc_learning_modules: [@learning_module1])
    @learning_module2 = create(:plc_learning_module, plc_course_unit: @course_unit)
    @task2 = create(:plc_task, plc_learning_modules: [@learning_module2])
    create(:plc_learning_module, plc_course_unit: @course_unit)
    @required_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::REQUIRED_MODULE)
  end

  test 'Enrolling user in a course creates other assignment objects' do
    enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @teacher, plc_course: @course)
    enrollment.create_enrollment_unit_assignments
    unit_enrollment = enrollment.plc_unit_assignments.first

    module_assignments = unit_enrollment.plc_module_assignments
    assert_equal Plc::EnrollmentUnitAssignment::START_BLOCKED, unit_enrollment.status
    assert_equal 1, module_assignments.count
    assert_equal @required_learning_module, module_assignments.first.plc_learning_module

    unit_enrollment.unlock_unit
    unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, unit_enrollment.status

    unit_enrollment.enroll_user_in_unit_with_learning_modules([@learning_module1, @learning_module2])
    unit_enrollment.reload

    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, unit_enrollment.status
    assert_equal 3, module_assignments.count
    assert_equal @required_learning_module, module_assignments.first.plc_learning_module
    assert_equal @learning_module1, module_assignments.second.plc_learning_module
    assert_equal @learning_module2, module_assignments.third.plc_learning_module

    assert_equal [
                    {
                        category:
                    },
                    {

                    },
                    {

                    }
                 ], unit_enrollment.summarize
  end

  test 'Summarizing progress of a course with peer reviews returns expected' do

  end
end
