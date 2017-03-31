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
    @level_concept_difficulty.assign_attributes({sequencing: 1})
    assert_nil @level_concept_difficulty.repeat_loops
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
    refute LevelConceptDifficulty.exists?(lcd_id)
  end

  test 'concept_difficulty_as_string' do
    level_concept_difficulty = LevelConceptDifficulty.new(
      level: create(:level),
      sequencing: 1,
      repeat_loops: 2
    )

    assert_equal 'seq: 1, repeat: 2',
      level_concept_difficulty.concept_difficulties_as_string
  end
end
