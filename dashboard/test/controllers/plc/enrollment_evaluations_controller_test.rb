require 'test_helper'

class Plc::EnrollmentEvaluationsControllerTest < ActionController::TestCase
  setup do
    # Questions/Answers taken from Monty Python and the Holy Grail in case it wasn't obvious. Figured it would be easier
    # then a bunch of strings with names like 'Answer 1'.

    # Rather then break up testing into each of the modules, I figure its easier to test the evaluation end-to-end
    # experience in this one file.

    # I used the dialogue from Monty Python because it's actually a decent example of an evaluation quiz that isn't
    # the same for everyone. Not all users taking an examination will answer the exact same questions.
    @plc_course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course)

    @module_required = create(:plc_learning_module, name: 'Required', plc_course_unit: @course_unit, module_type: Plc::LearningModule::REQUIRED_MODULE)

    @module_content_1 = create(:plc_learning_module, name: 'Getting thrown off cliffs', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)
    @module_content_2 = create(:plc_learning_module, name: 'Advanced Ornithology', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)

    @module_practice_1 = create(:plc_learning_module, name: 'Answering questions honestly', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)
    @module_practice_2 = create(:plc_learning_module, name: 'Not revealing your embarassing nickname', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)

    @user = create :teacher
    sign_in(@user)

    @enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @plc_course)
    @unit_assignment = @enrollment.plc_unit_assignments.first
  end

  test "previewing evaluation already triggers enrollments" do
    Plc::CourseUnit.any_instance.stubs(:determine_preferred_learning_modules).returns([@module_content_1, @module_practice_1])

    get :preview_assignments, params: {script_id: @course_unit.script.name}
    assert_equal (Set.new [@module_required, @module_content_1, @module_practice_1]), @unit_assignment.plc_module_assignments.map(&:plc_learning_module).to_set
  end

  test "submit evaluation enrolls user in appropriate modules" do
    post :confirm_assignments, params: {
      script_id: @course_unit.script.name,
      content_module: @module_content_1,
      practice_module: @module_practice_1
    }
    assert_redirected_to script_path(@course_unit.script)
    assert_equal (Set.new [@module_required, @module_content_1, @module_practice_1]), @unit_assignment.plc_module_assignments.map(&:plc_learning_module).to_set
  end

  test "Posting anything other than one content and one practice module to confirm_assignments gets redirected" do
    [
      [nil, nil],
      [@module_content_1, nil],
      [nil, @module_practice_1],
      [@module_content_1, @module_content_2],
      [@module_practice_1, @module_practice_2],
    ].each do |content_module, practice_module|
      params = {script_id: @course_unit.script.name, content_module: content_module, practice_module: practice_module}
      post :confirm_assignments, params: params.compact
      assert_redirected_to script_preview_assignments_path(@course_unit.script)
      assert_equal [@module_required], @unit_assignment.plc_module_assignments.map(&:plc_learning_module)
    end
  end

  test "Preserve existing enrollments when going to adjust focus area (but not actually adjusting)" do
    Plc::CourseUnit.any_instance.stubs(:determine_preferred_learning_modules).returns([@module_content_2, @module_practice_2])

    @unit_assignment.enroll_user_in_unit_with_learning_modules([@module_content_1, @module_practice_1])
    get :preview_assignments, params: {script_id: @course_unit.script.name}

    #In spite of the fact that the user answered stuff for content1 and practice1, their enrollment should still be 1, 1
    assert_equal (Set.new([@module_required, @module_content_1, @module_practice_1])), @unit_assignment.plc_module_assignments.map(&:plc_learning_module).to_set
  end
end
