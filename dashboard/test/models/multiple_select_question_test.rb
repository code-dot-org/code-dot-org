require 'test_helper'

class MultipleSelectQuestionTest < ActiveSupport::TestCase
  CHOICES = [{id: 'a', text: '2'}, {id: 'b', text: '3'}, {id: 'c', text: '4'}].freeze

  def content_with(correct_choice_ids)
    {question_title: 'Which of these are even?', choices: CHOICES, correct_choice_ids: correct_choice_ids}
  end

  test "valid factory is valid" do
    assert create(:multiple_select_question).valid?
  end

  test "auto_gradable? is true" do
    assert create(:multiple_select_question).auto_gradable?
  end

  test "grade scores exactly the correct selection as correct, in any order" do
    question = create(:multiple_select_question)
    assert_equal({score: 1, max_score: 1}, question.grade('selectedChoiceIds' => ['a', 'c']))
    assert_equal({score: 1, max_score: 1}, question.grade('selectedChoiceIds' => ['c', 'a']))
  end

  test "grade gives no partial credit" do
    question = create(:multiple_select_question)
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => ['a']))
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => ['a', 'b', 'c']))
  end

  test "grade scores a missing or malformed selection as incorrect" do
    question = create(:multiple_select_question)
    assert_equal({score: 0, max_score: 1}, question.grade({}))
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => []))
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => 'a'))
  end

  test "grade scores a selection with a repeated choice as incorrect" do
    question = create(:multiple_select_question)
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => ['a', 'a', 'c']))
  end

  test "answered? is true only when at least one choice is selected" do
    question = build(:multiple_select_question)
    assert question.answered?({'selectedChoiceIds' => ['a']})
    refute question.answered?({'selectedChoiceIds' => []})
    refute question.answered?({})
  end

  test "attempt_content_json omits the answer key" do
    question = create(:multiple_select_question)
    refute question.attempt_content_json.key?(:correctChoiceIds)
    assert_equal ['a', 'c'], question.builder_content_json[:correctChoiceIds]
  end

  test "requires at least one correct choice id" do
    refute build(:multiple_select_question, content: content_with([])).valid?
    refute build(:multiple_select_question, content: content_with(nil)).valid?
  end

  test "correct_choice_ids must reference existing choices" do
    refute build(:multiple_select_question, content: content_with(['a', 'not_a_real_id'])).valid?
  end

  test "correct_choice_ids must be unique" do
    refute build(:multiple_select_question, content: content_with(['a', 'a'])).valid?
  end

  test "requires at least 2 choices" do
    content = content_with(['a']).merge(choices: [{id: 'a', text: '2'}])
    refute build(:multiple_select_question, content: content).valid?
  end

  test "requires a non-blank question title" do
    refute build(:multiple_select_question, content: content_with(['a']).merge(question_title: '')).valid?
  end

  test "content_from_builder_params stores the correct choice ids" do
    params = ActionController::Parameters.new(
      questionTitle: 'Which of these are even?',
      choices: CHOICES,
      correctChoiceIds: ['a', 'c']
    ).permit(:questionTitle, choices: [:id, :text], correctChoiceIds: [])
    content = MultipleSelectQuestion.content_from_builder_params(params)
    assert_equal ['a', 'c'], content[:correct_choice_ids]
  end

  test "placeholder_content is valid" do
    question = build(:multiple_select_question)
    question.content = question.placeholder_content
    assert question.valid?
  end
end
