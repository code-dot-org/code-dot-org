require 'test_helper'

class FreeResponseQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:free_response_question).valid?
  end

  test "auto_gradable? is false" do
    refute create(:free_response_question).auto_gradable?
  end

  test "requires a non-blank question title" do
    refute build(:free_response_question, content: {question_title: '', description: 'x'}).valid?
    refute build(:free_response_question, content: {description: 'x'}).valid?
  end

  test "description is optional" do
    assert build(:free_response_question, content: {question_title: 'Why?'}).valid?
    assert build(:free_response_question, content: {question_title: 'Why?', description: ''}).valid?
  end

  test "builder and attempt json carry questionTitle and description" do
    question = create(:free_response_question)
    expected = {questionTitle: question.content['question_title'], description: question.content['description']}
    assert_equal expected, question.builder_content_json
    assert_equal expected, question.attempt_content_json
  end

  test "answered? is true only for non-blank answerText" do
    question = build(:free_response_question)
    assert question.answered?({'answerText' => 'Because'})
    refute question.answered?({'answerText' => '  '})
    refute question.answered?({})
  end

  test "description must be a string" do
    refute build(:free_response_question, content: {question_title: 'Why?', description: ['x']}).valid?
  end

  test "placeholder_content is valid" do
    question = build(:free_response_question)
    question.content = question.placeholder_content
    assert question.valid?
  end
end
