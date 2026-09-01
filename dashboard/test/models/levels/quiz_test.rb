require 'test_helper'

class QuizTest < ActiveSupport::TestCase
  test "uses_lab2? is true" do
    assert create(:quiz).uses_lab2?
  end

  test "purpose must be one of the known values" do
    quiz = create(:quiz)
    Quiz::PURPOSES.each do |purpose|
      quiz.purpose = purpose
      assert quiz.valid?
    end

    quiz.purpose = 'not_a_real_purpose'
    refute quiz.valid?
  end

  test "purpose may be nil" do
    quiz = create(:quiz)
    quiz.purpose = nil
    assert quiz.valid?
  end

  test "reveal_answer_explanation cannot be true unless show_correctness is true" do
    quiz = create(:quiz)
    quiz.show_correctness = false
    quiz.reveal_answer_explanation = true
    refute quiz.valid?
    assert_includes quiz.errors[:reveal_answer_explanation].join, 'show_correctness'

    quiz.show_correctness = true
    assert quiz.valid?
  end

  test "show_intro_screen cannot be false when time_limit_minutes is set" do
    quiz = create(:quiz, time_limit_minutes: nil, show_intro_screen: false)
    assert quiz.valid?

    quiz.time_limit_minutes = 20
    refute quiz.valid?
    assert_includes quiz.errors[:show_intro_screen].join, 'time_limit_minutes'

    quiz.show_intro_screen = true
    assert quiz.valid?
  end

  test "show_intro_screen may be false with custom_intro_text set and no time limit" do
    quiz = create(:quiz, time_limit_minutes: nil, custom_intro_text: 'Welcome!', show_intro_screen: false)
    assert quiz.valid?
  end

  test "questions come from placements" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    assert_equal [question], quiz.questions
  end

  test "max_attempts may be blank regardless of allow_multiple_attempts" do
    quiz = create(:quiz, allow_multiple_attempts: false, max_attempts: nil)
    assert quiz.valid?
  end

  test "max_attempts cannot be set unless allow_multiple_attempts is true" do
    quiz = create(:quiz, allow_multiple_attempts: false)
    quiz.max_attempts = 3
    refute quiz.valid?
    assert_includes quiz.errors[:max_attempts].join, 'allow_multiple_attempts'
  end

  test "max_attempts must be at least 2" do
    quiz = create(:quiz, allow_multiple_attempts: true)
    quiz.max_attempts = 1
    refute quiz.valid?

    quiz.max_attempts = 2
    assert quiz.valid?
  end

  test "destroying a quiz nullifies attempts rather than deleting them" do
    quiz = create(:quiz)
    attempt = create(:quiz_attempt, level: quiz)
    response = create(:quiz_question_response, quiz_attempt: attempt)

    quiz.destroy!

    attempt.reload
    assert_nil attempt.level_id
    assert QuizQuestionResponse.exists?(response.id)
  end
end
