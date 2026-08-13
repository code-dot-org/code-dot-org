require 'test_helper'

class MatchQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:match_question).valid?
  end

  test "requires at least 2 pairs" do
    question = build(
      :match_question,
      question: {
        stem: 'Match each animal to its sound.',
        pairs: [{id: '1', prompt: 'Cat', answer: 'Meow'}]
      }
    )
    refute question.valid?
  end

  test "requires pair ids to be unique" do
    question = build(
      :match_question,
      question: {
        stem: 'Match each animal to its sound.',
        pairs: [
          {id: '1', prompt: 'Cat', answer: 'Meow'},
          {id: '1', prompt: 'Dog', answer: 'Bark'}
        ]
      }
    )
    refute question.valid?
  end

  test "each pair requires a prompt and answer" do
    question = build(
      :match_question,
      question: {
        stem: 'Match each animal to its sound.',
        pairs: [
          {id: '1', prompt: 'Cat'},
          {id: '2', prompt: 'Dog', answer: 'Bark'}
        ]
      }
    )
    refute question.valid?
  end
end
