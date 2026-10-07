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

  test "creating a placement rewrites the quiz's .level file" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    Services::LevelFiles.expects(:write_custom_level_file).with(quiz)

    create(:quiz_question_placement, level: quiz, quiz_question: question, page: 1, position: 1)
  end

  test "destroying a placement rewrites the quiz's .level file" do
    quiz = create(:quiz)
    placement = create(:quiz_question_placement, level: quiz)
    Services::LevelFiles.expects(:write_custom_level_file).with(quiz)

    placement.destroy!
  end

  test "does not write a level file when the placement's level isn't a Quiz" do
    level = create(:level)
    # Built directly - the factory's `level factory: :quiz` default would
    # defeat the point of this test.
    placement = QuizQuestionPlacement.new(level: level, quiz_question: create(:quiz_question), page: 1, position: 1)
    Services::LevelFiles.expects(:write_custom_level_file).never

    placement.save!
  end
end
