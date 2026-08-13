require 'test_helper'

class QuizLevelQuestionTest < ActiveSupport::TestCase
  test "orders by page then position" do
    quiz = create(:quiz)
    third = create(:quiz_level_question, level: quiz, page: 2, position: 1)
    first = create(:quiz_level_question, level: quiz, page: 1, position: 1)
    second = create(:quiz_level_question, level: quiz, page: 1, position: 2)

    assert_equal [first, second, third], QuizLevelQuestion.where(level: quiz).to_a
  end

  test "a quiz_question cannot be included twice in the same level" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_level_question, level: quiz, quiz_question: question)

    assert_raises(ActiveRecord::RecordNotUnique) do
      QuizLevelQuestion.create!(level: quiz, quiz_question: question, page: 1, position: 2)
    end
  end
end
