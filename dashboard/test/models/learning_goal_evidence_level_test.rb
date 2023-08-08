require 'test_helper'

class LearningGoalEvidenceLevelTest < ActiveSupport::TestCase
  test 'validates understanding is a valid understanding level' do
    learning_goal = create :learning_goal

    valid_evidence_level = build :learning_goal_evidence_level, learning_goal: learning_goal, understanding: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.CONVINCING
    assert valid_evidence_level.valid?

    invalid_evidence_level = build :learning_goal_evidence_level, learning_goal: learning_goal, understanding: -1
    refute invalid_evidence_level.valid?
  end
end
