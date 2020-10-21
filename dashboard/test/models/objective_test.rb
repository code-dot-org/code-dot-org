require 'test_helper'

class ObjectiveTest < ActiveSupport::TestCase
  test "can create objective" do
    objective = Objective.new
    objective.description = 'what I will learn'
    objective.save!
    objective.reload
    assert_equal 'what I will learn', objective.description
  end

  test "summarize for edit" do
    objective = Objective.new
    objective.description = 'what I will learn'
    objective.save!
    objective.reload
    expected_summary = {id: objective.id, description: 'what I will learn'}
    assert_equal expected_summary, objective.summarize_for_edit
  end
end
