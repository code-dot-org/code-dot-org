require 'test_helper'

class PlcEvaluationQuestionsControllerTest < ActionController::TestCase
  setup do
    @plc_evaluation_question = plc_evaluation_questions(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:plc_evaluation_questions)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create plc_evaluation_question" do
    assert_difference('PlcEvaluationQuestion.count') do
      post :create, plc_evaluation_question: {  }
    end

    assert_redirected_to plc_evaluation_question_path(assigns(:plc_evaluation_question))
  end

  test "should show plc_evaluation_question" do
    get :show, id: @plc_evaluation_question
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @plc_evaluation_question
    assert_response :success
  end

  test "should update plc_evaluation_question" do
    patch :update, id: @plc_evaluation_question, plc_evaluation_question: {  }
    assert_redirected_to plc_evaluation_question_path(assigns(:plc_evaluation_question))
  end

  test "should destroy plc_evaluation_question" do
    assert_difference('PlcEvaluationQuestion.count', -1) do
      delete :destroy, id: @plc_evaluation_question
    end

    assert_redirected_to plc_evaluation_questions_path
  end
end
