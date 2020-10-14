require 'test_helper'

class Plc::EnrollmentUnitAssignmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @plc_course = create :plc_course
    @course_unit = create(:plc_course_unit, plc_course: @plc_course)
    @script = @course_unit.script
    @script.update(professional_learning_course: @plc_course.name)

    @required_lesson_group = create(:lesson_group, key: Plc::LearningModule::REQUIRED_MODULE, script: @script)
    @content_lesson_group = create(:lesson_group, key: Plc::LearningModule::CONTENT_MODULE, script: @script)
    @practice_lesson_group = create(:lesson_group, key: Plc::LearningModule::PRACTICE_MODULE, script: @script)

    @required_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: @required_lesson_group.key)
    @content_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: @content_lesson_group.key)
    @practice_learning_module = create(:plc_learning_module, plc_course_unit: @course_unit, module_type: @practice_lesson_group.key)

    @required_learning_module.lesson.update(script: @script, lesson_group: @required_lesson_group)
    @content_learning_module.lesson.update(script: @script, lesson_group: @content_lesson_group)
    @practice_learning_module.lesson.update(script: @script, lesson_group: @practice_lesson_group)

    Plc::EnrollmentModuleAssignment.any_instance.stubs(:status).returns(Plc::EnrollmentModuleAssignment::NOT_STARTED)

    @enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: @teacher, plc_course: @plc_course)
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

    # All the categories except Peer Review will be Content because there is no translation and that is the default
    assert_equal ["/s/#{@script.name}#required", "/s/#{@script.name}#content", "/s/#{@script.name}#practice", "/s/#{@script.name}#peer-review"].sort,
      @unit_enrollment.summarize_progress.map {|summary| summary[:link]}.sort

    assert_equal [Plc::EnrollmentModuleAssignment::NOT_STARTED],
      @unit_enrollment.summarize_progress.map {|summary| summary[:status]}.uniq
  end

  # All the categories except Peer Review will be Content because there is no translation and that is the default
  test 'Enrolling user in a course without an evaluation returns status appropriately' do
    Plc::CourseUnit.any_instance.stubs(:has_evaluation?).returns(false)

    assert_equal [
      {
        category: "Content",
        status: Plc::EnrollmentModuleAssignment::COMPLETED,
        link: "/s/#{@script.name}"
      },
      {
        category: "Content",
        status: Plc::EnrollmentModuleAssignment::COMPLETED,
        link: "/s/#{@script.name}"
      },
      {
        category: "Content",
        status: Plc::EnrollmentModuleAssignment::COMPLETED,
        link: "/s/#{@script.name}"
      }
    ], @unit_enrollment.summarize_progress
  end
end
