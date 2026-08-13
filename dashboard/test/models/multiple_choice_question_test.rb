require 'test_helper'

class MultipleChoiceQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:multiple_choice_question).valid?
  end

  test "requires a non-blank stem" do
    question = build(
      :multiple_choice_question,
      question: {
        stem: '',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_id: 'b'
      }
    )
    refute question.valid?
  end

  test "requires at least 2 choices" do
    question = build(
      :multiple_choice_question,
      question: {
        stem: 'What is 2 + 2?',
        choices: [{id: 'a', text: '4'}],
        correct_choice_id: 'a'
      }
    )
    refute question.valid?
  end

  test "requires choice ids to be unique" do
    question = build(
      :multiple_choice_question,
      question: {
        stem: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'a', text: '4'}],
        correct_choice_id: 'a'
      }
    )
    refute question.valid?
  end

  test "correct_choice_id must reference an existing choice" do
    question = build(
      :multiple_choice_question,
      question: {
        stem: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_id: 'not_a_real_id'
      }
    )
    refute question.valid?
  end
end
