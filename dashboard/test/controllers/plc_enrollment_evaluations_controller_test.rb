require 'test_helper'

class PlcEnrollmentEvaluationsControllerTest < ActionController::TestCase
  setup do
    @plc_enrollment_evaluation = plc_enrollment_evaluations(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:plc_enrollment_evaluations)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create plc_enrollment_evaluation" do
    assert_difference('PlcEnrollmentEvaluation.count') do
      post :create, plc_enrollment_evaluation: { plc_evaluation_answers: @plc_enrollment_evaluation.plc_evaluation_answers, user_professional_learning_course_enrollment_id: @plc_enrollment_evaluation.user_professional_learning_course_enrollment_id }
    end

    assert_redirected_to plc_enrollment_evaluation_path(assigns(:plc_enrollment_evaluation))
  end

  test "should show plc_enrollment_evaluation" do
    get :show, id: @plc_enrollment_evaluation
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @plc_enrollment_evaluation
    assert_response :success
  end

  test "should update plc_enrollment_evaluation" do
    patch :update, id: @plc_enrollment_evaluation, plc_enrollment_evaluation: { plc_evaluation_answers: @plc_enrollment_evaluation.plc_evaluation_answers, user_professional_learning_course_enrollment_id: @plc_enrollment_evaluation.user_professional_learning_course_enrollment_id }
    assert_redirected_to plc_enrollment_evaluation_path(assigns(:plc_enrollment_evaluation))
  end

  test "should destroy plc_enrollment_evaluation" do
    assert_difference('PlcEnrollmentEvaluation.count', -1) do
      delete :destroy, id: @plc_enrollment_evaluation
    end

    assert_redirected_to plc_enrollment_evaluations_path
  end
end
