require 'test_helper'

class Plc::EnrollmentModuleAssignmentTest < ActiveSupport::TestCase
  setup do
    plc_course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: plc_course)
    learning_module = create(:plc_learning_module, plc_course_unit: @course_unit)
    @level1 = create(:external_link, url: 'some url')
    @level2 = create :maze
    @level3 = create :applab
    @level4 = create :external
    @level5 = create :free_response
    @level5.update(peer_reviewable: 'false')
    @level6 = create :free_response
    @level6.update(peer_reviewable: 'true')

    [@level1, @level2, @level3, @level4, @level5, @level6].each do |level|
      create(:script_level, script: @course_unit.script, lesson: learning_module.lesson, levels: [level])
    end

    @user = create :teacher
    user_course_enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: plc_course)
    @enrollment_unit_assignment = create(:plc_enrollment_unit_assignment, plc_user_course_enrollment: user_course_enrollment, plc_course_unit: @course_unit, user: @user)
    @enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules([learning_module])
    @enrollment_unit_assignment.reload
  end

  test 'test module status reporting' do
    module_assignment = @enrollment_unit_assignment.plc_module_assignments.first

    assert_equal @user, module_assignment.user
    assert_equal Plc::EnrollmentModuleAssignment::NOT_STARTED, module_assignment.status

    track_progress_for_level(@level2, ActivityConstants::MINIMUM_PASS_RESULT)
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, module_assignment.status

    track_progress_for_level(@level3, ActivityConstants::BEST_PASS_RESULT)
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, module_assignment.status

    track_progress_for_level(@level5, ActivityConstants::BEST_PASS_RESULT)
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, module_assignment.status

    track_progress_for_level(@level6, ActivityConstants::UNREVIEWED_SUBMISSION_RESULT)
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, module_assignment.status

    track_progress_for_level(@level6, ActivityConstants::REVIEW_REJECTED_RESULT)
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, module_assignment.status

    track_progress_for_level(@level6, ActivityConstants::REVIEW_ACCEPTED_RESULT)
    assert_equal Plc::EnrollmentModuleAssignment::COMPLETED, module_assignment.status
  end

  private

  def track_progress_for_level(level, result)
    User.track_level_progress(
      user_id: @user.id,
      level_id: level.id,
      script_id: @course_unit.script.id,
      new_result: result,
      submitted: true,
      level_source_id: create(:level_source, level: level).id,
      pairing_user_ids: nil
    )
  end
end
