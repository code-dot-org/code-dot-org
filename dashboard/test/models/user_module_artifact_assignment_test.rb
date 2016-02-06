require 'test_helper'

class UserModuleArtifactAssignmentTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @plc = create :professional_learning_course
    @learning_module1 = create(:learning_module, name: 'Module1')
    @learning_module2 = create(:learning_module, name: 'Module2')
    @artifact1 = create(:artifact, name: 'Artifact1', learning_module: @learning_module1)
    @artifact2 = create(:artifact, name: 'Artifact2', learning_module: @learning_module1)
    @artifact3 = create(:artifact, name: 'Artifact3', learning_module: @learning_module2)
  end

  test 'Completing artifacts does not mark module / course complete until all are complete' do
    enrollment = PLC::UserCourseEnrollment.enroll_user_in_course_with_learning_modules(@user, @plc, [@learning_module1, @learning_module2])
    artifact_assignments = enrollment.user_module_artifact_assignment

    assert_not_equal :completed, enrollment.status
    assert_empty artifact_assignments.where(status: :completed).all

    artifact_assignments.first.complete_assignment
    assert_equal 'completed', artifact_assignments.first.status
    enrollment.reload
    assert_not_equal 'completed ', enrollment.status

    artifact_assignments.second.complete_assignment
    assert_equal 'completed', artifact_assignments.second.status
    enrollment.reload
    assert_not_equal 'completed', enrollment.status

    artifact_assignments.third.complete_assignment
    assert_equal 'completed', artifact_assignments.third.status
    enrollment.reload
    assert_equal 'completed', enrollment.status
  end

end
