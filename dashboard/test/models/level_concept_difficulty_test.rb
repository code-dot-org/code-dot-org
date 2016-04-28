require 'test_helper'

class LevelConceptDifficultyTest < ActiveSupport::TestCase
  setup do
    @level_concept_difficulty = create(:level_concept_difficulty)
  end

  test 'serializes to hash of just concepts' do
    hash = @level_concept_difficulty.serializable_hash
    assert_equal hash.keys, ["repeat_loops"]
  end

  test 'assign_attributes clears unassigned attributes' do
    assert_equal @level_concept_difficulty.repeat_loops, 2
    @level_concept_difficulty.assign_attributes({ sequencing: 1})
    assert_equal @level_concept_difficulty.repeat_loops, nil
    assert_equal @level_concept_difficulty.sequencing, 1
  end
end
