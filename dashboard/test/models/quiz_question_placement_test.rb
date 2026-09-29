require 'test_helper'

class QuizQuestionPlacementTest < ActiveSupport::TestCase
  test "orders by page then position" do
    quiz = create(:quiz)
    third = create(:quiz_question_placement, level: quiz, page: 2, position: 1)
    first = create(:quiz_question_placement, level: quiz, page: 1, position: 1)
    second = create(:quiz_question_placement, level: quiz, page: 1, position: 2)

    assert_equal [first, second, third], QuizQuestionPlacement.where(level: quiz).to_a
  end

  test "a quiz_question cannot be included twice in the same level" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    assert_raises(ActiveRecord::RecordNotUnique) do
      QuizQuestionPlacement.create!(level: quiz, quiz_question: question, page: 1, position: 2)
    end
  end
end
