require 'test_helper'

class MatchQuestionTest < ActiveSupport::TestCase
  PAIRS = [
    {id: 'p1', items: [{id: 'a', text: '1 + 1'}, {id: 'x', text: '2'}]},
    {id: 'p2', items: [{id: 'b', text: '2 + 1'}, {id: 'y', text: '3'}]},
  ].freeze

  def content_with(pairs)
    {question_title: 'Match each expression to its value.', pairs: pairs}
  end

  test "valid factory is valid" do
    assert create(:match_question).valid?
  end

  test "auto_gradable? is true" do
    assert create(:match_question).auto_gradable?
  end

  test "grade scores exactly the correct pairs as correct, in any order" do
    question = create(:match_question)
    assert_equal({score: 1, max_score: 1}, question.grade('pairs' => [['a', 'x'], ['b', 'y'], ['c', 'z']]))
    assert_equal({score: 1, max_score: 1}, question.grade('pairs' => [['z', 'c'], ['a', 'x'], ['y', 'b']]))
  end

  test "grade gives no partial credit" do
    question = create(:match_question)
    assert_equal({score: 0, max_score: 1}, question.grade('pairs' => [['a', 'x'], ['b', 'y']]))
    assert_equal({score: 0, max_score: 1}, question.grade('pairs' => [['a', 'y'], ['b', 'x'], ['c', 'z']]))
    assert_equal({score: 0, max_score: 1}, question.grade('pairs' => [['a', 'x'], ['b', 'y'], ['c', 'z'], ['a', 'y']]))
  end

  test "grade scores a missing or malformed response as incorrect" do
    question = create(:match_question)
    assert_equal({score: 0, max_score: 1}, question.grade({}))
    assert_equal({score: 0, max_score: 1}, question.grade('pairs' => []))
    assert_equal({score: 0, max_score: 1}, question.grade('pairs' => 'a'))
    assert_equal({score: 0, max_score: 1}, question.grade('pairs' => [['a', 'x', 'b'], ['b', 'y'], ['c', 'z']]))
  end

  test "response_answered? is true only when at least one pair is given" do
    question = build(:match_question)
    assert question.response_answered?({'pairs' => [['a', 'x']]})
    refute question.response_answered?({'pairs' => []})
    refute question.response_answered?({})
  end

  test "attempt_content_json splits the pairs into two sets and omits the answer key" do
    question = create(:match_question)
    json = question.attempt_content_json
    refute json.key?(:pairs)
    refute json.key?(:correctPairs)
    first, second = json[:matchSets]
    assert_equal ['a', 'b', 'c'], first.map {|i| i['id']}.sort
    assert_equal ['x', 'y', 'z'], second.map {|i| i['id']}.sort
  end

  test "answer_key_json lists each pair's item ids" do
    question = create(:match_question)
    assert_equal({correctPairs: [['a', 'x'], ['b', 'y'], ['c', 'z']]}, question.answer_key_json)
  end

  test "builder_content_json includes the pairs" do
    question = create(:match_question)
    assert_equal(['p1', 'p2', 'p3'], question.builder_content_json[:pairs].map {|p| p['id']})
  end

  test "requires at least 2 pairs" do
    refute build(:match_question, content: content_with(PAIRS.take(1))).valid?
    refute build(:match_question, content: content_with(nil)).valid?
  end

  test "each pair must have exactly 2 items" do
    pairs = PAIRS + [{id: 'p3', items: [{id: 'c', text: '2 + 2'}]}]
    refute build(:match_question, content: content_with(pairs)).valid?
  end

  test "pair ids must be unique" do
    pairs = PAIRS + [{id: 'p1', items: [{id: 'c', text: '2 + 2'}, {id: 'z', text: '4'}]}]
    refute build(:match_question, content: content_with(pairs)).valid?
  end

  test "item ids must be unique across pairs" do
    pairs = PAIRS + [{id: 'p3', items: [{id: 'c', text: '2 + 2'}, {id: 'x', text: '4'}]}]
    refute build(:match_question, content: content_with(pairs)).valid?
  end

  test "item text must be non-blank" do
    pairs = PAIRS + [{id: 'p3', items: [{id: 'c', text: '2 + 2'}, {id: 'z', text: ''}]}]
    refute build(:match_question, content: content_with(pairs)).valid?
  end

  test "requires a non-blank question title" do
    refute build(:match_question, content: content_with(PAIRS).merge(question_title: '')).valid?
  end

  test "content_from_builder_params stores the pairs" do
    params = ActionController::Parameters.new(
      questionTitle: 'Match each expression to its value.',
      pairs: PAIRS
    ).permit(:questionTitle, pairs: [:id, {items: [:id, :text]}])
    content = MatchQuestion.content_from_builder_params(params)
    assert_equal PAIRS.map(&:deep_stringify_keys), content[:pairs]
  end

  test "placeholder_content is valid" do
    question = build(:match_question)
    question.content = question.placeholder_content
    assert question.valid?
  end
end
