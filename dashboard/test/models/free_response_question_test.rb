require 'test_helper'

class FreeResponseQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:free_response_question).valid?
  end

  test "requires a non-blank stem" do
    question = build(:free_response_question, question: {stem: ''})
    refute question.valid?
  end

  test "does not require choices or a correct answer" do
    question = build(:free_response_question, question: {stem: 'Describe your favorite algorithm.'})
    assert question.valid?
  end
end
