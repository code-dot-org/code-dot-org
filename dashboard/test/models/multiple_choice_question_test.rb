require 'test_helper'

class MultipleChoiceQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:multiple_choice_question).valid?
  end

  test "auto_gradable? is true" do
    assert create(:multiple_choice_question).auto_gradable?
  end

  test "grade scores a correct selection" do
    question = create(:multiple_choice_question)
    assert_equal({score: 1, max_score: 1}, question.grade('selectedChoiceId' => 'b'))
  end

  test "grade scores an incorrect selection" do
    question = create(:multiple_choice_question)
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceId' => 'a'))
  end

  test "grade scores a missing/blank selection as incorrect" do
    question = create(:multiple_choice_question)
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceId' => nil))
    assert_equal({score: 0, max_score: 1}, question.grade({}))
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

  test "requires choice ids to be non-blank" do
    # An empty-string id would otherwise pass the string-type check and
    # could be stored as correct_choice_id - but grade only counts a
    # selection as correct when it's present, so "" could never actually
    # be graded as correct.
    question = build(
      :multiple_choice_question,
      question: {
        stem: 'What is 2 + 2?',
        choices: [{id: '', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_id: 'b'
      }
    )
    refute question.valid?
  end
end
