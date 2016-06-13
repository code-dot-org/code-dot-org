require 'test_helper'

class Plc::EnrollmentEvaluationsControllerTest < ActionController::TestCase
  setup do
    #Questions/Answers taken from Monty Python and the Holy Grail in case it wasn't obvious. Figured it would be easier
    #then a bunch of strings with names like 'Answer 1'

    #Rather then break up testing into each of the modules, I figure its easier to test the evaluation end-to-end
    #experience in this one file

    #I used the dialogue from Monty Python because it's actually a decent example of an evaluation quiz that isn't
    #the same for everyone. Not all users taking an examination will answer the exact same questions.
    @course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @course)

    @module_content_1 = create(:plc_learning_module, name: 'Getting thrown off cliffs', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)
    @module_content_2 = create(:plc_learning_module, name: 'Advanced Ornithology', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)

    @module_practice_1 = create(:plc_learning_module, name: 'Answering questions honestly', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)
    @module_practice_2 = create(:plc_learning_module, name: 'Not revealing your embarassing nickname', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)

    @user = create :teacher
    sign_in(@user)

    @enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @course)
    @unit_assignment = @enrollment.plc_unit_assignments.first
  end

  test "previewing evaluation already triggers enrollments" do
    # Argh, come on stubbing
    Plc::CourseUnit.any_instance.stubs(:determine_preferred_learning_modules).returns([@module_content_1, @module_practice_1])

    get :preview_assignments, script_id: @course_unit.script.name
    assert_equal [@module_content_1, @module_practice_1].sort, @unit_assignment.plc_module_assignments.map(&:plc_learning_module).sort
  end

  test "submit evaluation enrolls user in appropriate modules" do
    post :confirm_assignments, script_id: @course_unit.script.name, content_module: @module_content_1, practice_module: @module_practice_1
    assert_redirected_to script_path(@course_unit.script)
    assert_equal (Set.new [@module_content_1, @module_practice_1]), @unit_assignment.plc_module_assignments.map(&:plc_learning_module).to_set
  end

  test "Posting anything other than one content and one practice module to confirm_assignments gets redirected" do
    [
      [nil, nil],
      [@module_content_1, nil],
      [nil, @module_practice_1],
      [@module_content_1, @module_content_2],
      [@module_practice_1, @module_practice_2],
    ].each do |content_module, practice_module|
      post :confirm_assignments, script_id: @course_unit.script.name, content_module: content_module, practice_module: practice_module
      assert_redirected_to script_preview_assignments_path(@course_unit.script)
      assert_empty @unit_assignment.plc_module_assignments
    end
  end
end
