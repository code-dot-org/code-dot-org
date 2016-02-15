require 'test_helper'

class PlcEnrollmentEvaluationsControllerTest < ActionController::TestCase
  setup do
    #Questions/Answers taken from Monty Python and the Holy Grail in case it wasn't obvious. Figured it would be easier
    #then a bunch of strings with names like 'Answer 1'

    #Rather then break up testing into each of the modules, I figure its easier to test the evaluation end-to-end
    #experience in this one file

    #I used the dialogue from Monty Python because it's actually a decent example of an evaluation quiz that isn't
    #the same for everyone. Not all users taking an examination will answer the exact same questions.

    @user = create(:user)
    @course = create(:professional_learning_course)
    @module1 = create(:professional_learning_module, name: 'Getting thrown off cliffs')
    @module2 = create(:professional_learning_module, name: 'Advanced Ornithology')
    @module3 = create(:professional_learning_module, name: 'Answering questions honestly')
    @module4 = create(:professional_learning_module, name: 'Admitting ignorance')

    @task1 = create(:professional_learning_task, name: 'Answering with your name', professional_learning_module: @module3)
    @task2 = create(:professional_learning_task, name: 'Answering with your quest', professional_learning_module: @module3)
    @task3 = create(:professional_learning_task, name: 'Answering with your favorite color', professional_learning_module: @module3)
    @task4 = create(:professional_learning_task, name: 'Learn some Assyrian geography', professional_learning_module: @module4)
    @task5 = create(:professional_learning_task, name: 'Get clarification on Swallow Species', professional_learning_module: @module2)
    @task6 = create(:professional_learning_task, name: 'Not getting your favorite color right', professional_learning_module: @module1)

    @question1 = create(:plc_evaluation_question, question: 'What is your name', professional_learning_course: @course)
    @question2 = create(:plc_evaluation_question, question: 'What is your quest', professional_learning_course: @course)
    @question3 = create(:plc_evaluation_question, question: 'What is your favorite color?', professional_learning_course: @course)
    @question4 = create(:plc_evaluation_question, question: 'What is the capital of Assyria?', professional_learning_course: @course)
    @question5 = create(:plc_evaluation_question, question: 'What is the airspeed velocity of an unladen swallow', professional_learning_course: @course)

    @answer1_1 = create(:plc_evaluation_answer, answer: 'Sir Lancelot', plc_evaluation_question: @question1, professional_learning_task: @task1)
    @answer1_2 = create(:plc_evaluation_answer, answer: 'Sir Robin', plc_evaluation_question: @question1, professional_learning_task: @task1)
    @answer1_3 = create(:plc_evaluation_answer, answer: 'Sir Galahad', plc_evaluation_question: @question1, professional_learning_task: @task1)
    @answer1_4 = create(:plc_evaluation_answer, answer: 'King Arthur', plc_evaluation_question: @question1, professional_learning_task: @task1)
    @answer1_5 = create(:plc_evaluation_answer, answer: 'Sir Edgecase', plc_evaluation_question: @question1, professional_learning_task: nil)

    @answer2_1 = create(:plc_evaluation_answer, answer: 'I seek the Grail', plc_evaluation_question: @question2, professional_learning_task: @task2)
    #Not all answers are guaranteed to have associated tasks
    @answer2_2 = create(:plc_evaluation_answer, answer: 'I seek something else Grail', plc_evaluation_question: @question2, professional_learning_task: nil)

    @answer3_1 = create(:plc_evaluation_answer, answer: 'Blue', plc_evaluation_question: @question3, professional_learning_task: @task3)
    @answer3_2 = create(:plc_evaluation_answer, answer: 'Yellow - no, blue', plc_evaluation_question: @question3, professional_learning_task: @task6)
    @answer3_3= create(:plc_evaluation_answer, answer: 'No preference', plc_evaluation_question: @question3, professional_learning_task: nil)

    @answer4_1 = create(:plc_evaluation_answer, answer: 'I don\t know that', plc_evaluation_question: @question4, professional_learning_task: @task4)
    @answer4_2 = create(:plc_evaluation_answer, answer: 'Nineveh', plc_evaluation_question: @question4, professional_learning_task: nil)

    @answer5_1 = create(:plc_evaluation_answer, answer: 'What do you mean, an African or European Swallow', plc_evaluation_question: @question5, professional_learning_task: @task5)
    @answer5_2 = create(:plc_evaluation_answer, answer: '15 m/s', plc_evaluation_question: @question5, professional_learning_task: nil)

    @plc_enrollment = create(:user_professional_learning_course_enrollment, user: @user, professional_learning_course: @course)
  end

  test "perform_evaluation retrieves all questions and answers" do
    get :perform_evaluation, enrollment_id: @plc_enrollment.id
    questions = @controller.instance_variable_get(:@questions)

    assert_equal 5, questions.count, 'There should be five questions'
    assert_equal 5, questions.first.plc_evaluation_answer.count, 'The first question should have three answers'
    assert_equal 2, questions.second.plc_evaluation_answer.count, 'The second question should have two answers'
    assert_equal 3, questions.third.plc_evaluation_answer.count, 'The third question should have three answers'
    assert_equal 2, questions.fourth.plc_evaluation_answer.count, 'The fourth question should have two answers'
    assert_equal 2, questions.fifth.plc_evaluation_answer.count, 'The fifth question should have two answers'
  end

  test "submit evaluation enrolls user in appropriate modules" do
    #This can get simplified once I start using the hidden field in user submission

    #Sir Lancelot says that his name is Lancelot, his quest is to seek the grail, and that his favorite color is blue.
    #He should be enrolled only in "Answering questions honestly"
    a1 = @answer1_1.professional_learning_task_id
    a2 = @answer2_1.professional_learning_task_id
    a3 = @answer3_1.professional_learning_task_id
    post :submit_evaluation, enrollment_id: @plc_enrollment.id, question_1: a1, question_2: a2, question_3: a3
    assert_equal 1, @plc_enrollment.user_enrollment_module_assignment.count
    assert_equal @module3.name, @plc_enrollment.user_enrollment_module_assignment.first.professional_learning_module.name

    #Sir Robin says that his name is Robin, his quest is to seek the grail, and that he doesn't know the capital of Assyria
    #He should be enrolled in "Answering questions honestly" and "Admitting Ignorance"
    a1 = @answer1_2.professional_learning_task_id
    a2 = @answer2_1.professional_learning_task_id
    a3 = @answer4_1.professional_learning_task_id
    post :submit_evaluation, enrollment_id: @plc_enrollment.id, question_1: a1, question_2: a2, question_3: a3
    assert_equal 2, @plc_enrollment.user_enrollment_module_assignment.count
    assert_equal @module3.name, @plc_enrollment.user_enrollment_module_assignment.first.professional_learning_module.name
    assert_equal @module4.name, @plc_enrollment.user_enrollment_module_assignment.second.professional_learning_module.name

    #Sir Galahad says that his name is Galahad, his quest is to seek the grail, and that his favorite color is blue - no, yellow
    #He should be enrolled in "Answering questions honestly" and "Getting thrown off cliffs"
    a1 = @answer1_3.professional_learning_task_id
    a2 = @answer2_1.professional_learning_task_id
    a3 = @answer3_2.professional_learning_task_id
    post :submit_evaluation, enrollment_id: @plc_enrollment.id, question_1: a1, question_2: a2, question_3: a3
    assert_equal 2, @plc_enrollment.user_enrollment_module_assignment.count
    assert_equal @module3.name, @plc_enrollment.user_enrollment_module_assignment.first.professional_learning_module.name
    assert_equal @module1.name, @plc_enrollment.user_enrollment_module_assignment.second.professional_learning_module.name

    #King Arthur says that his name is Arthur, his quest is to seek the grail, and needs clarification on swallow speed
    #He should be enrolled in "Answering questions honestly" and "Advanced Ornitholoy"
    a1 = @answer1_4.professional_learning_task_id
    a2 = @answer2_1.professional_learning_task_id
    a3 = @answer5_1.professional_learning_task_id
    post :submit_evaluation, enrollment_id: @plc_enrollment.id, question_1: a1, question_2: a2, question_3: a3
    assert_equal 2, @plc_enrollment.user_enrollment_module_assignment.count
    assert_equal @module3.name, @plc_enrollment.user_enrollment_module_assignment.first.professional_learning_module.name
    assert_equal @module2.name, @plc_enrollment.user_enrollment_module_assignment.second.professional_learning_module.name

    #Sir Edgecase of Edgecaseville should be enrolled in no modules
    a1 = @answer1_5.professional_learning_task_id
    a2 = @answer3_3.professional_learning_task_id
    a3 = @answer5_2.professional_learning_task_id
    post :submit_evaluation, enrollment_id: @plc_enrollment.id, question_1: a1, question_2: a2, question_3: a3
    assert_equal 0, @plc_enrollment.user_enrollment_module_assignment.count
  end
end
