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

  test "quiz_questions come from quiz_level_questions" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_level_question, level: quiz, quiz_question: question)

    assert_equal [question], quiz.quiz_questions
  end
end
