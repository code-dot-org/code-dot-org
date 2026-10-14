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

  test "attempt_content_json omits the answer key" do
    question = create(:multiple_choice_question)
    refute question.attempt_content_json.key?(:correctChoiceId)
    assert_equal 'b', question.builder_content_json[:correctChoiceId]
  end

  test "attempt and builder json both carry the description" do
    question = create(:multiple_choice_question)
    question.update!(content: question.content.merge('description' => 'Add them.'))
    assert_equal 'Add them.', question.attempt_content_json[:description]
    assert_equal 'Add them.', question.builder_content_json[:description]
  end

  test "requires a non-blank question title" do
    question = build(
      :multiple_choice_question,
      content: {
        question_title: '',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_id: 'b'
      }
    )
    refute question.valid?
  end

  test "accepts a string description and rejects a non-string one" do
    content = {
      question_title: 'What is 2 + 2?',
      choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
      correct_choice_id: 'b'
    }
    assert build(:multiple_choice_question, content: content.merge(description: 'Add them.')).valid?
    refute build(:multiple_choice_question, content: content.merge(description: ['Add them.'])).valid?
  end

  test "requires at least 2 choices" do
    question = build(
      :multiple_choice_question,
      content: {
        question_title: 'What is 2 + 2?',
        choices: [{id: 'a', text: '4'}],
        correct_choice_id: 'a'
      }
    )
    refute question.valid?
  end

  test "requires choice ids to be unique" do
    question = build(
      :multiple_choice_question,
      content: {
        question_title: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'a', text: '4'}],
        correct_choice_id: 'a'
      }
    )
    refute question.valid?
  end

  test "correct_choice_id must reference an existing choice" do
    question = build(
      :multiple_choice_question,
      content: {
        question_title: 'What is 2 + 2?',
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
      content: {
        question_title: 'What is 2 + 2?',
        choices: [{id: '', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_id: 'b'
      }
    )
    refute question.valid?
  end

  test "requires choice text to be non-blank" do
    # An empty-string text would otherwise pass the string-type check and
    # render as an answer choice with no visible label.
    question = build(
      :multiple_choice_question,
      content: {
        question_title: 'What is 2 + 2?',
        choices: [{id: 'a', text: ''}, {id: 'b', text: '4'}],
        correct_choice_id: 'b'
      }
    )
    refute question.valid?
  end

  test "answered? is true only when a choice is selected" do
    question = build(:multiple_choice_question)
    assert question.answered?({'selectedChoiceId' => 'b'})
    refute question.answered?({'selectedChoiceId' => ''})
    refute question.answered?({})
  end
end
