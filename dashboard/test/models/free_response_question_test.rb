require 'test_helper'

class FreeResponseQuestionTest < ActiveSupport::TestCase
  test "valid factory is valid" do
    assert create(:free_response_question).valid?
  end

  test "auto_gradable? is false" do
    refute create(:free_response_question).auto_gradable?
  end

  test "requires a non-blank questionTitle" do
    refute build(:free_response_question, content: {questionTitle: '', description: 'x'}).valid?
    refute build(:free_response_question, content: {description: 'x'}).valid?
  end

  test "description is optional" do
    assert build(:free_response_question, content: {questionTitle: 'Why?'}).valid?
    assert build(:free_response_question, content: {questionTitle: 'Why?', description: ''}).valid?
  end

  test "editor and student json carry questionTitle and description" do
    question = create(:free_response_question)
    expected = {questionTitle: question.content['questionTitle'], description: question.content['description']}
    assert_equal expected, question.editor_content_json
    assert_equal expected, question.student_content_json
  end

  test "description must be a string" do
    refute build(:free_response_question, content: {questionTitle: 'Why?', description: ['x']}).valid?
  end
end
