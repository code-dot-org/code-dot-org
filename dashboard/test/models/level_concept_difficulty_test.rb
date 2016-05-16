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

  test 'level_concept_difficulty deleted when level deleted' do
    level = Level.create(name: 'test delete level_concept_difficulty', type: 'Maze')
    LevelConceptDifficulty.create(
      level: level,
      sequencing: 1,
      repeat_loops: 2
    )

    lcd_id = level.level_concept_difficulty.id
    assert LevelConceptDifficulty.exists?(lcd_id)
    level.destroy
    assert !LevelConceptDifficulty.exists?(lcd_id)
  end
end
