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

  test "destroying a quiz removes its placements and leaves bank questions" do
    quiz = create(:quiz)
    other_quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)
    create(:quiz_question_placement, level: other_quiz, quiz_question: question)

    quiz.destroy!

    refute QuizQuestionPlacement.exists?(level: quiz, quiz_question: question)
    assert QuizQuestionPlacement.exists?(level: other_quiz, quiz_question: question)
    assert QuizQuestion.exists?(question.id)
  end

  test "destroying a quiz disconnects attempts rather than deleting them" do
    quiz = create(:quiz)
    attempt = create(:quiz_attempt, level: quiz)
    response = create(:quiz_question_response, quiz_attempt: attempt)

    quiz.destroy!

    attempt.reload
    assert_equal quiz.id, attempt.level_id
    assert_nil attempt.level
    assert QuizQuestionResponse.exists?(response.id)
  end

  test "clone_with_suffix copies placements and shares questions" do
    quiz = create(:quiz)
    first_question = create(:quiz_question)
    second_question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: first_question, page: 1, position: 1)
    create(:quiz_question_placement, level: quiz, quiz_question: second_question, page: 2, position: 1)

    copy = quiz.clone_with_suffix('_copy')

    refute_equal quiz, copy
    assert_equal [first_question, second_question], copy.questions
    assert_equal [[1, 1], [2, 1]], (copy.placements.map {|p| [p.page, p.position]})
    assert_equal 1, QuizQuestionPlacement.where(level: quiz, quiz_question: first_question).count
    assert_equal 1, QuizQuestionPlacement.where(level: copy, quiz_question: first_question).count
  end

  test "clone_with_suffix returns an existing clone without duplicating placements" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    first = quiz.clone_with_suffix('_copy')
    second = quiz.clone_with_suffix('_copy')

    assert_equal first, second
    assert_equal 1, first.placements.count
  end

  test "clone_with_suffix with allow_existing false creates a new quiz with placements" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    first = quiz.clone_with_suffix('_copy')
    second = quiz.clone_with_suffix('_copy', allow_existing: false)

    refute_equal first, second
    assert_equal [question], second.questions
  end

  test "clone_with_suffix truncates long names before checking for an existing clone" do
    old_name = 'x' * 67
    suffix = '_long_suffix'
    quiz = create(:quiz, name: old_name)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    first = quiz.clone_with_suffix(suffix)
    second = quiz.clone_with_suffix(suffix)

    assert_equal 70, first.name.length
    assert_equal first, second
    assert_equal 1, first.placements.count
  end
end
