require 'test_helper'

class QuizQuestionResponseTest < ActiveSupport::TestCase
  test "grading_status must be one of the known values" do
    response = create(:quiz_question_response)
    QuizQuestionResponse::GRADING_STATUSES.each do |status|
      response.grading_status = status
      assert response.valid?
    end

    response.grading_status = 'not_a_real_status'
    refute response.valid?
  end

  test "requires response_data" do
    response = build(:quiz_question_response, response_data: nil)
    refute response.valid?
    assert_includes response.errors.attribute_names, :response_data
  end

  test "a quiz_question cannot have two responses within the same attempt" do
    attempt = create(:quiz_attempt)
    question = create(:quiz_question)
    create(:quiz_question_response, quiz_attempt: attempt, quiz_question: question)

    assert_raises(ActiveRecord::RecordNotUnique) do
      QuizQuestionResponse.create!(
        quiz_attempt: attempt,
        quiz_question: question,
        response_data: {selected: ['3']},
        grading_status: 'auto_graded'
      )
    end
  end
end
