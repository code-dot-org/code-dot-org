require 'test_helper'

class LevelConceptDifficultyTest < ActiveSupport::TestCase
  setup do
    @level_concept_difficulty = create :level_concept_difficulty
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

  test 'gets attributes when created as part of Level' do
    # Newly-created level has no LevelConceptDifficulty by default.
    level = create :level
    assert_nil level.level_concept_difficulty

    # Assigning a level_concept_difficulty hash to a Level without one
    # creates a new LevelConceptDifficulty with appropriate properties.
    level.assign_attributes(
      'level_concept_difficulty' => {'sequencing' => 3}
    )
    refute_nil level.level_concept_difficulty
    assert_equal 3, level.level_concept_difficulty.sequencing

    # Saving the level saves the new LevelConceptDifficulty
    assert_creates LevelConceptDifficulty do
      level.save!
    end
  end

  test 'gets attributes when updated as part of Level' do
    lcd = create :level_concept_difficulty, sequencing: 4
    level = lcd.level
    assert_equal 4, level.level_concept_difficulty.sequencing
    assert_nil level.level_concept_difficulty.debugging

    # Assigning a level_concept_difficulty hash to a Level with one
    # updates the existing LevelConceptDifficulty, clearing omitted properties.
    level.assign_attributes(
      'level_concept_difficulty' => {'debugging' => 5}
    )
    assert_nil level.level_concept_difficulty.sequencing
    assert_equal 5, level.level_concept_difficulty.debugging
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
