require 'test_helper'

class QuizAttemptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @quiz = create(:quiz)
    @question = create(:multiple_choice_question)
    create(:quiz_level_question, level: @quiz, quiz_question: @question)
    @attempt = create(:quiz_attempt, user: @student, level: @quiz)
  end

  test "update scores only auto-graded responses for questions on the quiz" do
    create(
      :quiz_question_response,
      quiz_attempt: @attempt,
      quiz_question: @question,
      score: 1,
      max_score: 1,
      grading_status: 'auto_graded'
    )

    off_quiz_question = create(:multiple_choice_question)
    create(
      :quiz_question_response,
      quiz_attempt: @attempt,
      quiz_question: off_quiz_question,
      score: 1,
      max_score: 1,
      grading_status: 'auto_graded'
    )

    sign_in @student
    put :update, params: {id: @attempt.id}

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 1, body['score']
    assert_equal 1, body['maxScore']
    assert_equal 1, @attempt.reload.score
    assert_equal 1, @attempt.max_score
  end
end
