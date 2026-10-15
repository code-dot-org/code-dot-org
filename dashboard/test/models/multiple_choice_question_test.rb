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
    assert_equal({score: 1, max_score: 1}, question.grade('selectedChoiceIds' => ['b']))
  end

  test "grade scores an incorrect selection" do
    question = create(:multiple_choice_question)
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => ['a']))
  end

  test "grade scores a missing/blank selection as incorrect" do
    question = create(:multiple_choice_question)
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => nil))
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => []))
    assert_equal({score: 0, max_score: 1}, question.grade({}))
  end

  test "attempt_content_json omits the answer key" do
    question = create(:multiple_choice_question)
    refute question.attempt_content_json.key?(:correctChoiceIds)
    assert_equal ['b'], question.builder_content_json[:correctChoiceIds]
  end

  test "selectMultiple is false unless content sets it" do
    question = create(:multiple_choice_question)
    assert_equal false, question.attempt_content_json[:selectMultiple]
    question.update!(content: question.content.merge('select_multiple' => true))
    assert_equal true, question.attempt_content_json[:selectMultiple]
  end

  test "grade requires exactly the correct choices when selecting multiple" do
    question = create(:multiple_choice_question, :select_multiple)
    assert_equal({score: 1, max_score: 1}, question.grade('selectedChoiceIds' => ['c', 'a']))
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => ['a']))
    assert_equal({score: 0, max_score: 1}, question.grade('selectedChoiceIds' => ['a', 'b', 'c']))
  end

  test "allows several correct choices only when selecting multiple" do
    content = {
      question_title: 'Which are odd?',
      choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}, {id: 'c', text: '3'}],
      correct_choice_ids: ['a', 'c']
    }
    refute build(:multiple_choice_question, content: content).valid?
    refute build(:multiple_choice_question, content: content.merge(select_multiple: false)).valid?
    assert build(:multiple_choice_question, content: content.merge(select_multiple: true)).valid?
  end

  test "rejects a non-boolean select_multiple" do
    question = build(:multiple_choice_question)
    question.content = question.content.merge('select_multiple' => 'true')
    refute question.valid?
  end

  test "requires at least one correct choice, without duplicates" do
    question = build(:multiple_choice_question, :select_multiple)
    question.content = question.content.merge('correct_choice_ids' => [])
    refute question.valid?
    question.content = question.content.merge('correct_choice_ids' => ['a', 'a'])
    refute question.valid?
  end

  test "content_from_builder_params reads correctChoiceIds and selectMultiple" do
    params = ActionController::Parameters.new(
      questionTitle: 'Which are odd?',
      choices: [{id: 'a', text: '1'}, {id: 'b', text: '2'}],
      correctChoiceIds: ['a'],
      selectMultiple: true
    ).permit(:questionTitle, :selectMultiple, correctChoiceIds: [], choices: [:id, :text])
    content = MultipleChoiceQuestion.content_from_builder_params(params)
    assert_equal ['a'], content[:correct_choice_ids]
    assert_equal true, content[:select_multiple]
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
        correct_choice_ids: ['b']
      }
    )
    refute question.valid?
  end

  test "accepts a string description and rejects a non-string one" do
    content = {
      question_title: 'What is 2 + 2?',
      choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
      correct_choice_ids: ['b']
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
        correct_choice_ids: ['a']
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
        correct_choice_ids: ['a']
      }
    )
    refute question.valid?
  end

  test "correct_choice_ids must reference an existing choice" do
    question = build(
      :multiple_choice_question,
      content: {
        question_title: 'What is 2 + 2?',
        choices: [{id: 'a', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_ids: ['not_a_real_id']
      }
    )
    refute question.valid?
  end

  test "requires choice ids to be non-blank" do
    # An empty-string id would otherwise pass the string-type check and
    # could be stored in correct_choice_ids - but grade only counts a
    # selection as correct when it's present, so "" could never actually
    # be graded as correct.
    question = build(
      :multiple_choice_question,
      content: {
        question_title: 'What is 2 + 2?',
        choices: [{id: '', text: '3'}, {id: 'b', text: '4'}],
        correct_choice_ids: ['b']
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
        correct_choice_ids: ['b']
      }
    )
    refute question.valid?
  end

  test "answered? is true only when a choice is selected" do
    question = build(:multiple_choice_question)
    assert question.answered?({'selectedChoiceIds' => ['b']})
    refute question.answered?({'selectedChoiceIds' => ['']})
    refute question.answered?({})
  end

  test "placeholder_content is valid" do
    question = build(:multiple_choice_question)
    question.content = question.placeholder_content
    assert question.valid?
  end
end
