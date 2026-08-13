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
end
