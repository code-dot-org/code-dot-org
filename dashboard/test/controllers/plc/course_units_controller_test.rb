require 'test_helper'

class Plc::CourseUnitsControllerTest < ActionController::TestCase
  setup do
    @course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @user = create(:admin)
    sign_in(@user)

    @module1 = create(:plc_learning_module, name: 'Module 1', plc_course_unit: @course_unit)
    @module2 = create(:plc_learning_module, name: 'Module 2', plc_course_unit: @course_unit)
    @question = create(:plc_evaluation_question, plc_course_unit: @course_unit, question: 'Some question')
  end

  test "should show plc_course_unit" do
    get :show, id: @course_unit
    assert_response :success
  end

  test "should create evaluation questions" do
    post :submit_new_questions_and_answers, id: @course_unit, newQuestionsList: ['question 1', 'question 2'].to_s, newAnswersList: [].to_s
    assert_redirected_to plc_course_unit_path(assigns(:course_unit))

    assert_equal 2, Plc::EvaluationQuestion.where(question: ['question 1', 'question 2']).count
  end

  test "should create evaluation answers" do
    post :submit_new_questions_and_answers, id: @course_unit, newQuestionsList: [].to_s,
         newAnswersList: %Q{{"#{@question.id}": [{"answer": "Answer1", "learningModuleId": "#{@module1.id}"},
                                                 {"answer": "Answer2", "learningModuleId": "#{@module2.id}"}]}}

    assert_redirected_to plc_course_unit_path(assigns(:course_unit))

    assert_equal 2, Plc::EvaluationAnswer.where(plc_evaluation_question: @question).count
    assert_equal 1, Plc::EvaluationAnswer.where(plc_learning_module_id: @module1.id).count
    assert_equal 1, Plc::EvaluationAnswer.where(plc_learning_module_id: @module2.id).count
  end
end
