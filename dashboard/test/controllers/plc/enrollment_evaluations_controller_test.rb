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
    @module1 = create(:plc_learning_module, name: 'Getting thrown off cliffs')
    @module2 = create(:plc_learning_module, name: 'Advanced Ornithology')
    @module3 = create(:plc_learning_module, name: 'Answering questions honestly')
    @module4 = create(:plc_learning_module, name: 'Admitting ignorance')

    @question1 = create(:plc_evaluation_question, question: 'What is your name', plc_course_unit: @course_unit)
    @question2 = create(:plc_evaluation_question, question: 'What is your quest', plc_course_unit: @course_unit)
    @question3 = create(:plc_evaluation_question, question: 'What is your favorite color?', plc_course_unit: @course_unit)
    @question4 = create(:plc_evaluation_question, question: 'What is the capital of Assyria?', plc_course_unit: @course_unit)
    @question5 = create(:plc_evaluation_question, question: 'What is the airspeed velocity of an unladen swallow', plc_course_unit: @course_unit)

    @answer1_1 = create(:plc_evaluation_answer, answer: 'Sir Lancelot', plc_evaluation_question: @question1, plc_learning_module: @module3)
    @answer1_2 = create(:plc_evaluation_answer, answer: 'Sir Robin', plc_evaluation_question: @question1, plc_learning_module: @module3)
    @answer1_3 = create(:plc_evaluation_answer, answer: 'Sir Galahad', plc_evaluation_question: @question1, plc_learning_module: @module3)
    @answer1_4 = create(:plc_evaluation_answer, answer: 'King Arthur', plc_evaluation_question: @question1, plc_learning_module: @module3)
    @answer1_5 = create(:plc_evaluation_answer, answer: 'Sir Edgecase', plc_evaluation_question: @question1, plc_learning_module: nil)

    @answer2_1 = create(:plc_evaluation_answer, answer: 'I seek the Grail', plc_evaluation_question: @question2, plc_learning_module: @module3)
    #Not all answers are guaranteed to have associated modules
    @answer2_2 = create(:plc_evaluation_answer, answer: 'I seek something else', plc_evaluation_question: @question2, plc_learning_module: nil)

    @answer3_1 = create(:plc_evaluation_answer, answer: 'Blue', plc_evaluation_question: @question3, plc_learning_module: @module3)
    @answer3_2 = create(:plc_evaluation_answer, answer: 'Yellow - no, blue', plc_evaluation_question: @question3, plc_learning_module: @module1)
    @answer3_3= create(:plc_evaluation_answer, answer: 'No preference', plc_evaluation_question: @question3, plc_learning_module: nil)

    @answer4_1 = create(:plc_evaluation_answer, answer: 'I don\t know that', plc_evaluation_question: @question4, plc_learning_module: @module4)
    @answer4_2 = create(:plc_evaluation_answer, answer: 'Nineveh', plc_evaluation_question: @question4, plc_learning_module: nil)

    @answer5_1 = create(:plc_evaluation_answer, answer: 'What do you mean, an African or European Swallow', plc_evaluation_question: @question5, plc_learning_module: @module2)
    @answer5_2 = create(:plc_evaluation_answer, answer: '15 m/s', plc_evaluation_question: @question5, plc_learning_module: nil)

    @user = create :admin
    sign_in(@user)

    @enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @course)
    @unit_assignment = create(:plc_enrollment_unit_assignment, plc_user_course_enrollment: @enrollment,
                              plc_course_unit: @course_unit, status: Plc::EnrollmentUnitAssignment::PENDING_EVALUATION)
  end

  test "perform_evaluation retrieves all questions and answers" do
    get :perform_evaluation, unit_assignment_id: @unit_assignment.id
    questions = assigns(:questions)

    assert_equal 5, questions.count, 'There should be five questions'
    assert_equal 5, questions.first.plc_evaluation_answers.count, 'The first question should have three answers'
    assert_equal 2, questions.second.plc_evaluation_answers.count, 'The second question should have two answers'
    assert_equal 3, questions.third.plc_evaluation_answers.count, 'The third question should have three answers'
    assert_equal 2, questions.fourth.plc_evaluation_answers.count, 'The fourth question should have two answers'
    assert_equal 2, questions.fifth.plc_evaluation_answers.count, 'The fifth question should have two answers'
  end

  test "submit evaluation enrolls user in appropriate modules" do
    #Sir Lancelot says that his name is Lancelot, his quest is to seek the grail, and that his favorite color is blue.
    #He should be enrolled only in "Answering questions honestly"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_1.plc_learning_module_id, @answer2_1.plc_learning_module_id, @answer3_1.plc_learning_module_id].to_s, [@module3])

    #Sir Robin says that his name is Robin, his quest is to seek the grail, and that he doesn't know the capital of Assyria
    #He should be enrolled in "Answering questions honestly" and "Admitting Ignorance"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_2.plc_learning_module_id, @answer2_1.plc_learning_module_id, @answer4_1.plc_learning_module_id].to_s, [@module3, @module4])

    #Sir Galahad says that his name is Galahad, his quest is to seek the grail, and that his favorite color is blue - no, yellow
    #He should be enrolled in "Answering questions honestly" and "Getting thrown off cliffs"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_3.plc_learning_module_id, @answer2_1.plc_learning_module_id, @answer3_2.plc_learning_module_id].to_s, [@module3, @module1])

    #King Arthur says that his name is Arthur, his quest is to seek the grail, and needs clarification on swallow speed
    #He should be enrolled in "Answering questions honestly" and "Advanced Ornitholoy"
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_4.plc_learning_module_id, @answer2_1.plc_learning_module_id, @answer5_1.plc_learning_module_id].to_s, [@module3, @module2])

    #Sir Edgecase of Edgecaseville should be enrolled in no modules
    do_expected_answers_yield_expected_module_enrollments(
        [@answer1_5.plc_learning_module_id, @answer3_3.plc_learning_module_id, @answer5_2.plc_learning_module_id].to_s, [])
  end

  private
  def do_expected_answers_yield_expected_module_enrollments(answers, expected_module_enrollments)
    post :submit_evaluation, unit_assignment_id: @unit_assignment.id, answerModuleList: answers
    @unit_assignment.reload
    assert_equal expected_module_enrollments.map(&:id).sort, @enrollment.plc_module_assignments.all.map(&:plc_learning_module_id).sort
  end
end
