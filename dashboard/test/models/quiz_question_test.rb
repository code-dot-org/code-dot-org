require 'test_helper'

class QuizQuestionTest < ActiveSupport::TestCase
  test "creates a plain QuizQuestion row via STI" do
    question = create(:quiz_question)
    assert_equal 'QuizQuestion', QuizQuestion.find(question.id).type
  end

  test "requires question_key, question_name, and question" do
    question = build(:quiz_question, question_key: nil, question_name: nil, question: nil)
    refute question.valid?
    assert_includes question.errors.attribute_names, :question_key
    assert_includes question.errors.attribute_names, :question_name
    assert_includes question.errors.attribute_names, :question
  end

  test "a question need not be tagged with any Standard" do
    question = create(:quiz_question)
    assert_empty question.standards
  end

  test "can be tagged with a Standard via QuizQuestionStandard" do
    question = create(:quiz_question)
    standard = create(:standard)
    create(:quiz_question_standard, quiz_question: question, standard: standard)

    assert_equal [standard], question.reload.standards
  end

  test "parent_id chains a question to the prior revision" do
    original = create(:quiz_question)
    revision = create(:quiz_question, parent: original)

    assert_equal original, revision.parent
  end
end
