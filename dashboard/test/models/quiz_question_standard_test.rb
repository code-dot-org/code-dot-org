require 'test_helper'

class QuizQuestionStandardTest < ActiveSupport::TestCase
  test "links a quiz_question to a standard" do
    quiz_question_standard = create(:quiz_question_standard)

    assert quiz_question_standard.quiz_question.is_a?(QuizQuestion)
    assert quiz_question_standard.standard.is_a?(Standard)
  end

  test "a quiz_question can be tagged with more than one standard" do
    question = create(:quiz_question)
    standard1 = create(:standard)
    standard2 = create(:standard)
    create(:quiz_question_standard, quiz_question: question, standard: standard1)
    create(:quiz_question_standard, quiz_question: question, standard: standard2)

    assert_equal [standard1, standard2], question.reload.standards
  end
end
