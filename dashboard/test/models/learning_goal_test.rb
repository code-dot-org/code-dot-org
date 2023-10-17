require 'test_helper'

class LearningGoalTest < ActiveSupport::TestCase
  test 'generates key on create if one isnt present' do
    learning_goal = create :learning_goal, key: nil
    learning_goal.reload
    assert learning_goal.key.present?
  end

  test 'does not generate key on create if one is present' do
    learning_goal = create :learning_goal, key: 'intentionally-present-key'
    learning_goal.reload
    assert_equal 'intentionally-present-key', learning_goal.key
  end
end
