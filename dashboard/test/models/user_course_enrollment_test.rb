require 'test_helper'

class UserCourseEnrollmentTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  setup do
    @user = create :teacher
    @plc = create :professional_learning_course
    @learning_module = create :learning_module
    @artifact1 = create(:artifact, learning_module: @learning_module)
  end

  test 'Enrolling user in a course creates other assignment objects' do
    PLC::UserCourseEnrollment.enroll_user_in_course_with_learning_modules(@user, @plc, [@learning_module])

    enrollment = PLC::UserCourseEnrollment.find_by(user: @user, professional_learning_course: @plc)

    module_assignments = enrollment.user_enrollment_module_assignment
    artifact_assignments = enrollment.user_module_artifact_assignment

    assert_equal 1, module_assignments.count
    assert_equal 1, artifact_assignments.count
    assert_equal @learning_module, module_assignments.first.learning_module
    assert_equal @artifact1, artifact_assignments.first.artifact
  end
end
