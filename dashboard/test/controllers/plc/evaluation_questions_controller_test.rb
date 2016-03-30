require 'test_helper'

class Plc::EvaluationQuestionsControllerTest < ActionController::TestCase
  setup do
    user = create(:admin)
    sign_in(user)
    course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: course)
    @plc_evaluation_question = create(:plc_evaluation_question, plc_course_unit: @course_unit)
  end

  test "should destroy plc_evaluation_question" do
    assert_difference('Plc::EvaluationQuestion.count', -1) do
      delete :destroy, id: @plc_evaluation_question
    end

    assert_nil Plc::EvaluationQuestion.find_by_id(@plc_evaluation_question.id)

    assert_redirected_to plc_course_unit_path(@course_unit)
  end
end
