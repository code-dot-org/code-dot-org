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

    @module_cliffs = create(:plc_learning_module, name: 'Getting thrown off cliffs', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)
    @module_ornithology = create(:plc_learning_module, name: 'Advanced Ornithology', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)
    @module_ignorance = create(:plc_learning_module, name: 'Admitting ignorance', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)
    @module_blue = create(:plc_learning_module, name: 'Blue appreciation', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)

    @module_honesty = create(:plc_learning_module, name: 'Answering questions honestly', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)
    @module_no_nickname = create(:plc_learning_module, name: 'Not revealing your embarassing nickname', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)

    #<editor-fold desc="test questions and answers">
    @question1 = create(:plc_evaluation_question, question: 'What is your name', plc_course_unit: @course_unit)
    @question2 = create(:plc_evaluation_question, question: 'What is your quest', plc_course_unit: @course_unit)
    @question3 = create(:plc_evaluation_question, question: 'What is your favorite color?', plc_course_unit: @course_unit)
    @question4 = create(:plc_evaluation_question, question: 'What is the capital of Assyria?', plc_course_unit: @course_unit)
    @question5 = create(:plc_evaluation_question, question: 'What is the airspeed velocity of an unladen swallow', plc_course_unit: @course_unit)

    @answer1_1 = create(:plc_evaluation_answer, answer: 'Sir Lancelot', plc_evaluation_question: @question1, plc_learning_module: @module_honesty)
    @answer1_2 = create(:plc_evaluation_answer, answer: 'Sir Robin', plc_evaluation_question: @question1, plc_learning_module: @module_no_nickname)
    @answer1_3 = create(:plc_evaluation_answer, answer: 'Sir Galahad', plc_evaluation_question: @question1, plc_learning_module: @module_honesty)
    @answer1_4 = create(:plc_evaluation_answer, answer: 'King Arthur', plc_evaluation_question: @question1, plc_learning_module: @module_honesty)
    @answer1_5 = create(:plc_evaluation_answer, answer: 'Sir Edgecase', plc_evaluation_question: @question1, plc_learning_module: nil)

    @answer2_1 = create(:plc_evaluation_answer, answer: 'I seek the Grail', plc_evaluation_question: @question2, plc_learning_module: @module_honesty)
    @answer2_2 = create(:plc_evaluation_answer, answer: 'Yes, yes, I seek the Grail', plc_evaluation_question: @question2, plc_learning_module: @module_no_nickname)
    #Not all answers are guaranteed to have associated modules
    @answer2_3 = create(:plc_evaluation_answer, answer: 'I seek something else', plc_evaluation_question: @question2, plc_learning_module: nil)

    @answer3_1 = create(:plc_evaluation_answer, answer: 'Blue', plc_evaluation_question: @question3, plc_learning_module: @module_blue)
    @answer3_2 = create(:plc_evaluation_answer, answer: 'Yellow - no, blue', plc_evaluation_question: @question3, plc_learning_module: @module_cliffs)
    @answer3_3= create(:plc_evaluation_answer, answer: 'No preference', plc_evaluation_question: @question3, plc_learning_module: nil)

    @answer4_1 = create(:plc_evaluation_answer, answer: 'I don\t know that', plc_evaluation_question: @question4, plc_learning_module: @module_ignorance)
    @answer4_2 = create(:plc_evaluation_answer, answer: 'Nineveh', plc_evaluation_question: @question4, plc_learning_module: nil)

    @answer5_1 = create(:plc_evaluation_answer, answer: 'What do you mean, an African or European Swallow', plc_evaluation_question: @question5, plc_learning_module: @module_ornithology)
    @answer5_2 = create(:plc_evaluation_answer, answer: '15 m/s', plc_evaluation_question: @question5, plc_learning_module: nil)
    #</editor-fold>

    @user = create :teacher
    sign_in(@user)

    @enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @course)
    @unit_assignment = create(:plc_enrollment_unit_assignment,
                              plc_user_course_enrollment: @enrollment,
                              plc_course_unit: @course_unit,
                              status: Plc::EnrollmentUnitAssignment::IN_PROGRESS,
                              user: @user)
  end

  test "perform_evaluation retrieves all questions and answers" do
    get :perform_evaluation, unit_assignment_id: @unit_assignment.id
    questions = assigns(:questions)

    assert_equal 5, questions.count, 'There should be five questions'
    assert_equal 5, questions.first.plc_evaluation_answers.count, 'The first question should have three answers'
    assert_equal 3, questions.second.plc_evaluation_answers.count, 'The second question should have two answers'
    assert_equal 3, questions.third.plc_evaluation_answers.count, 'The third question should have three answers'
    assert_equal 2, questions.fourth.plc_evaluation_answers.count, 'The fourth question should have two answers'
    assert_equal 2, questions.fifth.plc_evaluation_answers.count, 'The fifth question should have two answers'
  end

  test "submit evaluation enrolls user in appropriate modules" do
    #Sir Lancelot says that his name is Lancelot, his quest is to seek the grail, and that his favorite color is blue.
    #He should be enrolled in "Answering questions honestly" and "Blue appreciation"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_1, @answer2_1, @answer3_1], {content_module: @module_blue, practice_module: @module_honesty},
        true)

    #Sir Robin says that his name is Robin, his quest is to seek the grail, and that he doesn't know the capital of Assyria
    #He should be enrolled in "Not revealing your nickname" and "Admitting Ignorance"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_2, @answer2_2, @answer4_1], {content_module: @module_ignorance, practice_module: @module_no_nickname},
        true)

    #Sir Galahad says that his name is Galahad, his quest is to seek the grail, and that his favorite color is blue - no, yellow
    #He should be enrolled in "Answering questions honestly" and "Getting thrown off cliffs"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_3, @answer2_1, @answer3_2], {content_module: @module_cliffs, practice_module: @module_honesty},
        true)

    #King Arthur says that his name is Arthur, his quest is to seek the grail, and needs clarification on swallow speed
    #He should be enrolled in "Answering questions honestly" and "Advanced Ornitholoy"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_4, @answer2_1, @answer5_1], {content_module: @module_ornithology, practice_module: @module_honesty},
        true)
  end

  test "submit evaluation redirects to original enrollment screen if there are no modules to enroll in" do
    #Sir Edgecase of Edgecaseville should be enrolled in no modules and get redirected
    do_expected_answers_yield_expected_module_enrollments([@answer1_5, @answer3_3, @answer5_2], {}, false)
  end

  test "Answers with no learning modules are handled properly" do
    #Handle nil answers properly
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_5, @answer2_1, @answer5_1], {content_module: @module_ornithology, practice_module: @module_honesty},
        true)
  end

  test "Posting anything other than one content and one practice module to confirm_assignments gets redirected" do
    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: nil, practice_module: nil
    assert_redirected_to perform_evaluation_path(unit_assignment_id: @unit_assignment.id)

    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: @module_cliffs, practice_module: nil
    assert_redirected_to perform_evaluation_path(unit_assignment_id: @unit_assignment.id)

    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: nil, practice_module: @module_honesty
    assert_redirected_to perform_evaluation_path(unit_assignment_id: @unit_assignment.id)

    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: @module_cliffs, practice_module: @module_cliffs
    assert_redirected_to perform_evaluation_path(unit_assignment_id: @unit_assignment.id)

    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: @module_honesty, practice_module: @module_honesty
    assert_redirected_to perform_evaluation_path(unit_assignment_id: @unit_assignment.id)

  end

  test "Cannot do actions on enrollments that are not mine" do
    other_user = create :teacher
    sign_out(@user)
    sign_in(other_user)

    get :perform_evaluation, unit_assignment_id: @unit_assignment.id
    assert_response :forbidden

    post :submit_evaluation, unit_assignment_id: @unit_assignment.id, answer_module_list: [@answer1_1]
    assert_response :forbidden

    get :preview_assignments, unit_assignment_id: @unit_assignment.id, enrolled_modules: "#{@module_honesty.id},#{@module_honesty.id}"
    assert_response :forbidden

    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: @module_blue.id, practice_module: @module_honesty.id
    assert_response :forbidden
  end

  private
  def do_expected_answers_yield_expected_module_enrollments(answers, expected_module_enrollments, valid_answers)
    answers_hash = Hash.new(0)

    answers.each do |answer|
      next if answer.plc_learning_module_id.nil?
      answers_hash[answer.plc_learning_module_id] += 1
    end
    answers_hash.each {|k, v| answers_hash[k] = v.to_s}

    post :submit_evaluation, unit_assignment_id: @unit_assignment.id, answer_module_list: answers_hash.to_json
    assert_redirected_to controller: :enrollment_evaluations, action: :preview_assignments, enrolled_modules: expected_module_enrollments.values.map(&:id)

    post :confirm_assignments, unit_assignment_id: @unit_assignment.id, content_module: expected_module_enrollments[:content_module].try(:id), practice_module: expected_module_enrollments[:practice_module].try(:id)

    if valid_answers
      assert_redirected_to plc_enrollment_unit_assignment_path(@unit_assignment)

      @unit_assignment.reload
      assert_equal expected_module_enrollments.values.map(&:id).sort, @enrollment.plc_module_assignments.all.map(&:plc_learning_module_id).sort
    else
      assert_redirected_to perform_evaluation_path(unit_assignment_id: @unit_assignment.id)
    end
  end
end
