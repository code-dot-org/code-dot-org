require 'test_helper'

class Plc::EnrollmentUnitAssignmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @script = @course_unit.script
    @script.update(professional_learning_course: @course.name)

    @required_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::REQUIRED_MODULE)
    @content_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)
    @practice_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)

    @required_learning_module.stage.update(script: @script, flex_category: Plc::LearningModule::REQUIRED_MODULE)
    @content_learning_module.stage.update(script: @script, flex_category: Plc::LearningModule::CONTENT_MODULE)
    @practice_learning_module.stage.update(script: @script, flex_category: Plc::LearningModule::PRACTICE_MODULE)

    Plc::EnrollmentModuleAssignment.any_instance.stubs(:status).returns(Plc::EnrollmentModuleAssignment::NOT_STARTED)

    @enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @teacher, plc_course: @course)
    @unit_enrollment = @enrollment.plc_unit_assignments.first
  end

  test 'Enrolling user in a course creates other assignment objects' do
    module_assignments = @unit_enrollment.plc_module_assignments
    assert_equal Plc::EnrollmentUnitAssignment::START_BLOCKED, @unit_enrollment.status
    assert_equal 1, module_assignments.count
    assert_equal @required_learning_module, module_assignments.first.plc_learning_module

    @unit_enrollment.unlock_unit
    @unit_enrollment.reload
    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, @unit_enrollment.status

    @unit_enrollment.enroll_user_in_unit_with_learning_modules([@content_learning_module, @practice_learning_module])
    @unit_enrollment.reload

    assert_equal Plc::EnrollmentUnitAssignment::IN_PROGRESS, @unit_enrollment.status
    assert_equal 3, module_assignments.count
    assert_equal @required_learning_module, module_assignments.first.plc_learning_module
    assert_equal @content_learning_module, module_assignments.second.plc_learning_module
    assert_equal @practice_learning_module, module_assignments.third.plc_learning_module

    Plc::CourseUnit.any_instance.stubs(:has_evaluation?).returns(true)

    @script.update(peer_reviews_to_complete: 2)
    PeerReview.stubs(:get_review_completion_status).returns(Plc::EnrollmentModuleAssignment::NOT_STARTED)

    assert_equal [
      {
        category: "Overview",
        status: Plc::EnrollmentModuleAssignment::NOT_STARTED,
        link: "/s/#{@script.name}#overview"
      },
      {
        category: "Content",
        status: Plc::EnrollmentModuleAssignment::NOT_STARTED,
        link: "/s/#{@script.name}#content"
      },
      {
        category: "Teaching Practices",
        status: Plc::EnrollmentModuleAssignment::NOT_STARTED,
        link: "/s/#{@script.name}#teaching-practices"
      },
      {
        category: "Peer Review",
        status: Plc::EnrollmentModuleAssignment::NOT_STARTED,
        link: "/s/#{@script.name}#peer-review"
      }
    ], @unit_enrollment.summarize_progress
  end

  test 'Enrolling user in a course without an evaluation returns status appropriately' do
    Plc::CourseUnit.any_instance.stubs(:has_evaluation?).returns(false)

    assert_equal [
      {
        category: "Teaching Practices",
        status: Plc::EnrollmentModuleAssignment::COMPLETED,
        link: "/s/#{@script.name}"
      },
      {
        category: "Content",
        status: Plc::EnrollmentModuleAssignment::COMPLETED,
        link: "/s/#{@script.name}"
      },
      {
        category: "Overview",
        status: Plc::EnrollmentModuleAssignment::COMPLETED,
        link: "/s/#{@script.name}"
      }
    ], @unit_enrollment.summarize_progress
  end
end
