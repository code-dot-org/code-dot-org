require 'test_helper'

class ObjectiveTest < ActiveSupport::TestCase
  test "can create objective" do
    objective = Objective.new
    objective.description = 'what I will learn'
    objective.save!
    objective.reload
    assert_equal 'what I will learn', objective.description
  end
end
