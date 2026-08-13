require 'test_helper'

class MultipleSelectQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:multiple_select_question).valid?
  end

  test "requires at least one correct_choice_id" do
    question = build(
      :multiple_select_question,
      question: {
        stem: 'Select all even numbers.',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}],
        correct_choice_ids: []
      }
    )
    refute question.valid?
  end

  test "correct_choice_ids must not contain duplicates" do
    question = build(
      :multiple_select_question,
      question: {
        stem: 'Select all even numbers.',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}],
        correct_choice_ids: ['b', 'b']
      }
    )
    refute question.valid?
  end

  test "correct_choice_ids must all reference an existing choice" do
    question = build(
      :multiple_select_question,
      question: {
        stem: 'Select all even numbers.',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}],
        correct_choice_ids: ['b', 'not_a_real_id']
      }
    )
    refute question.valid?
  end

  test "allows more than one correct choice" do
    question = build(
      :multiple_select_question,
      question: {
        stem: 'Select all even numbers.',
        choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}, {id: 'c', text: '4'}],
        correct_choice_ids: ['b', 'c']
      }
    )
    assert question.valid?
  end
end
