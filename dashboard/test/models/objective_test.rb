require 'test_helper'

class ObjectiveTest < ActiveSupport::TestCase
  test "can create objective" do
    objective = Objective.new
    objective.description = 'what I will learn'
    objective.key = 'my-key'
    objective.save!
    objective.reload
    assert_equal 'what I will learn', objective.description
  end

  test "summarize" do
    objective = Objective.new
    objective.description = 'what I will learn'
    objective.key = 'my-key'
    objective.save!
    objective.reload
    expected_edit_summary = {id: objective.id, description: 'what I will learn', key: objective.key}
    expected_show_summary = {id: objective.id, description: 'what I will learn'}
    assert_equal expected_edit_summary, objective.summarize_for_edit
    assert_equal expected_show_summary, objective.summarize_for_lesson_show
  end
end
