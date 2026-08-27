require 'test_helper'

class QuizQuestionResponsesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @quiz = create(:quiz)
    @question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: @quiz, quiz_question: @question)
    @attempt = create(:quiz_attempt, user: @student, level: @quiz)
  end

  test "create redirects to sign in when not signed in" do
    post :create, params: {
      quizAttemptId: @attempt.id,
      quizQuestionId: @question.id,
      responseData: {selectedChoiceId: 'b'}
    }
    assert_redirected_to_sign_in
  end

  test "create auto-grades a question that belongs to the attempt's quiz" do
    sign_in @student

    assert_difference 'QuizQuestionResponse.count', 1 do
      post :create, params: {
        quizAttemptId: @attempt.id,
        quizQuestionId: @question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 1, body['score']
    assert_equal 1, body['maxScore']
    assert_equal 'auto_graded', body['gradingStatus']

    created = QuizQuestionResponse.find(body['id'])
    assert_equal @attempt.id, created.quiz_attempt_id
    assert_equal @question.id, created.quiz_question_id
  end

  test "create updates the existing response instead of duplicating it on resubmission" do
    sign_in @student
    post :create, params: {
      quizAttemptId: @attempt.id, quizQuestionId: @question.id,
      responseData: {selectedChoiceId: 'a'}
    }

    assert_no_difference 'QuizQuestionResponse.count' do
      post :create, params: {
        quizAttemptId: @attempt.id, quizQuestionId: @question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 1, body['score']
  end

  test "create rejects a question that is not on the attempt's quiz" do
    other_question = create(:multiple_choice_question)
    sign_in @student

    assert_no_difference 'QuizQuestionResponse.count' do
      post :create, params: {
        quizAttemptId: @attempt.id,
        quizQuestionId: other_question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :bad_request
  end

  test "create rejects a question that belongs only to a different quiz" do
    other_quiz = create(:quiz)
    other_question = create(:multiple_choice_question)
    create(:quiz_question_placement, level: other_quiz, quiz_question: other_question)
    sign_in @student

    assert_no_difference 'QuizQuestionResponse.count' do
      post :create, params: {
        quizAttemptId: @attempt.id,
        quizQuestionId: other_question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :bad_request
  end

  test "create rejects another user's attempt" do
    other_attempt = create(:quiz_attempt, level: @quiz)
    sign_in @student

    assert_no_difference 'QuizQuestionResponse.count' do
      post :create, params: {
        quizAttemptId: other_attempt.id,
        quizQuestionId: @question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :bad_request
  end

  test "create rejects a response once the attempt is already submitted" do
    @attempt.update!(submitted_at: Time.now)
    sign_in @student

    assert_no_difference 'QuizQuestionResponse.count' do
      post :create, params: {
        quizAttemptId: @attempt.id,
        quizQuestionId: @question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :bad_request
  end

  test "create rejects a response once the time limit has passed" do
    @quiz.update!(time_limit_minutes: 10)
    @attempt.update!(started_at: 1.hour.ago)
    sign_in @student

    assert_no_difference 'QuizQuestionResponse.count' do
      post :create, params: {
        quizAttemptId: @attempt.id,
        quizQuestionId: @question.id,
        responseData: {selectedChoiceId: 'b'}
      }
    end

    assert_response :bad_request
  end
end
