require 'test_helper'

class UserProfessionalLearningCourseEnrollmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @plc = create :professional_learning_course
    @learning_module = create :professional_learning_module
    @plc_task = create(:professional_learning_task, professional_learning_module: @learning_module)
  end

  test 'Enrolling user in a course creates other assignment objects' do
    enrollment = UserProfessionalLearningCourseEnrollment.find_or_create_by(user: @teacher, professional_learning_course: @plc)
    enrollment.enroll_user_in_course_with_learning_modules([@learning_module])
    enrollment.reload
    module_assignments = enrollment.user_enrollment_module_assignment
    task_assignments = enrollment.user_module_task_assignment

    assert_equal 1, module_assignments.count
    assert_equal 1, task_assignments.count
    assert_equal @learning_module, module_assignments.first.professional_learning_module
    assert_equal @plc_task, task_assignments.first.professional_learning_task
  end
end
