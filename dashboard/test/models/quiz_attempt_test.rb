require 'test_helper'

class QuizAttemptTest < ActiveSupport::TestCase
  test "requires attempt_number and started_at" do
    attempt = build(:quiz_attempt, attempt_number: nil, started_at: nil)
    refute attempt.valid?
    assert_includes attempt.errors.attribute_names, :attempt_number
    assert_includes attempt.errors.attribute_names, :started_at
  end

  test "a user cannot have two rows for the same level/script/attempt_number" do
    quiz = create(:quiz)
    user = create(:user)
    script = create(:script)
    create(:quiz_attempt, user: user, level: quiz, script: script, attempt_number: 1)

    assert_raises(ActiveRecord::RecordNotUnique) do
      QuizAttempt.create!(user: user, level: quiz, script: script, attempt_number: 1, started_at: Time.now)
    end
  end

  test "destroying an attempt destroys its quiz_question_responses" do
    attempt = create(:quiz_attempt)
    response = create(:quiz_question_response, quiz_attempt: attempt)

    attempt.destroy!

    refute QuizQuestionResponse.exists?(response.id)
  end

  test "expires_at is nil when the quiz has no time limit" do
    quiz = create(:quiz, time_limit_minutes: nil)
    attempt = create(:quiz_attempt, level: quiz)
    assert_nil attempt.expires_at
    refute attempt.expired?
  end

  test "expires_at/expired? follow started_at + the quiz's time_limit_minutes" do
    quiz = create(:quiz, time_limit_minutes: 10)
    Timecop.freeze(Time.local(2026, 1, 1, 12, 0, 0)) do
      attempt = create(:quiz_attempt, level: quiz, started_at: Time.now)
      assert_equal Time.local(2026, 1, 1, 12, 10, 0), attempt.expires_at

      Timecop.travel(Time.local(2026, 1, 1, 12, 9, 0)) do
        refute attempt.expired?
      end
      Timecop.travel(Time.local(2026, 1, 1, 12, 11, 0)) do
        assert attempt.expired?
      end
    end
  end

  test "response_deadline_passed? allows a grace period past expires_at" do
    quiz = create(:quiz, time_limit_minutes: 10)
    Timecop.freeze(Time.local(2026, 1, 1, 12, 0, 0)) do
      attempt = create(:quiz_attempt, level: quiz, started_at: Time.now)

      Timecop.travel(attempt.expires_at + QuizAttempt::RESPONSE_GRACE_PERIOD - 1.second) do
        refute attempt.response_deadline_passed?
      end
      Timecop.travel(attempt.expires_at + QuizAttempt::RESPONSE_GRACE_PERIOD + 1.second) do
        assert attempt.response_deadline_passed?
      end
    end
  end

  test "retakeable? is false while the attempt is unsubmitted" do
    quiz = create(:quiz, allow_multiple_attempts: true)
    attempt = create(:quiz_attempt, level: quiz, submitted_at: nil)
    refute attempt.retakeable?
  end

  test "retakeable? is false once submitted unless the quiz allows multiple attempts" do
    quiz = create(:quiz, allow_multiple_attempts: false)
    attempt = create(:quiz_attempt, level: quiz, submitted_at: Time.now)
    refute attempt.retakeable?
  end

  test "retakeable? is true once submitted when the quiz allows multiple attempts and max_attempts is blank" do
    quiz = create(:quiz, allow_multiple_attempts: true, max_attempts: nil)
    attempt = create(:quiz_attempt, level: quiz, submitted_at: Time.now, attempt_number: 5)
    assert attempt.retakeable?
  end

  test "retakeable? respects max_attempts" do
    quiz = create(:quiz, allow_multiple_attempts: true, max_attempts: 2)
    within_limit = create(:quiz_attempt, level: quiz, submitted_at: Time.now, attempt_number: 1)
    at_limit = create(:quiz_attempt, level: quiz, submitted_at: Time.now, attempt_number: 2)

    assert within_limit.retakeable?
    refute at_limit.retakeable?
  end

  test "question_results is nil until the attempt is submitted" do
    attempt = create(:quiz_attempt, submitted_at: nil)
    assert_nil attempt.question_results
  end

  test "question_results only reveals correctness/explanation per the quiz's settings" do
    quiz = create(:quiz, show_correctness: false, reveal_answer_explanation: false)
    question = create(:multiple_choice_question, explanation: 'because math')
    create(:quiz_level_question, level: quiz, quiz_question: question)
    attempt = create(:quiz_attempt, level: quiz, submitted_at: Time.now)
    create(
      :quiz_question_response,
      quiz_attempt: attempt,
      quiz_question: question,
      response_data: {'selectedChoiceId' => 'b'},
      grading_status: 'auto_graded',
      score: 1,
      max_score: 1
    )

    result = attempt.question_results.first
    assert_equal question.id, result[:quiz_question_id]
    assert_equal 'b', result[:selected_choice_id]
    assert_nil result[:correct]
    assert_nil result[:explanation]
    assert_nil result[:correct_choice_id]

    quiz.update!(show_correctness: true, reveal_answer_explanation: true)
    result = attempt.reload.question_results.first
    assert result[:correct]
    assert_equal 'because math', result[:explanation]
    assert_equal 'b', result[:correct_choice_id]
  end
end
