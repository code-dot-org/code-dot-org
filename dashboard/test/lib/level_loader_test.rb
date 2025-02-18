require 'test_helper'

class LevelLoaderTest < ActiveSupport::TestCase
  test 'creates Bee Fixture' do
    # Ensure we're creating a new level
    assert_nil Level.find_by_name('Bee Fixture')

    # Load level from disk
    LevelLoader.import_levels 'test/fixtures/levels/Bee Fixture.level'

    # Check that loaded level has all expected properties and associations
    level = Level.find_by_name('Bee Fixture')
    assert level.is_a? Maze
    assert_equal Game.custom_maze, level.game
    refute level.published?

    assert_equal 'bee', level.skin
    assert_equal 'Move me to the flower, get the nectar, then move me to the honeycomb, and make honey',
      level.short_instructions
    assert_equal '2', level.start_direction
    assert level.is_k1
    assert_equal "1", level.nectar_goal
    assert_equal "1", level.honey_goal
    assert_equal "redWithNectar", level.flower_type
    assert_equal "/script_assets/k_1_images/instruction_gifs/22_V1.gif", level.ani_gif_url
    assert_equal "true", level.skip_instructions_popup
    assert_equal "7", level.ideal
    assert_equal "false", level.never_autoplay_video
    assert_equal "true", level.disable_param_editing
    assert_equal "false", level.disable_variable_editing
    assert_equal "false", level.use_modal_function_editor
    assert_equal "false", level.use_contract_editor
    assert_equal "false", level.contract_highlight
    assert_equal "false", level.contract_collapse
    assert_equal "false", level.examples_highlight
    assert_equal "false", level.examples_collapse
    assert_equal "false", level.examples_required
    assert_equal "false", level.definition_highlight
    assert_equal "false", level.definition_collapse
    assert_equal "false", level.disable_examples
    assert_equal "false", level.fast_get_nectar_animation
    assert_equal '[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,2,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['maze']
    assert_equal '[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,0,-1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['initial_dirt']
    assert_equal '[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['final_dirt']

    # Nested attributes: LevelConceptDifficulty must get attributes from fixture.
    assert_equal 3, level.level_concept_difficulty.sequencing

    # Ideal Level Source: Should create one matching the level's solution blocks
    refute_nil level.ideal_level_source
    assert_equal level.solution_blocks, level.ideal_level_source.data
  end

  test 'updates Bee Fixture' do
    # Create level from disk
    assert_nil Level.find_by_name('Bee Fixture')
    LevelLoader.import_levels 'test/fixtures/levels/Bee Fixture.level'

    # Update the Bee Fixture level from disk.
    # Same filename, causes us to update the level, but we're actually loading
    # a different file here to check that changes occur.
    refute_nil Level.find_by_name('Bee Fixture')
    LevelLoader.import_levels 'test/fixtures/levels_alternate/Bee Fixture.level'

    # Check that loaded level has all expected properties and associations
    level = Level.find_by_name('Bee Fixture')
    assert level.is_a? Maze
    assert_equal Game.custom_maze, level.game

    assert_equal '[[1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,2,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['maze']
    assert_equal '[[1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,0,-1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['initial_dirt']
    assert_equal '[[1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['final_dirt']

    # Nested attributes: LevelConceptDifficulty must get updated attributes
    # from fixture and clear out attributes missing from fixture.
    assert_nil level.level_concept_difficulty.sequencing
    assert_equal 2, level.level_concept_difficulty.functions

    # Ideal Level Source: Updates ideal_level_source to match level data.
    refute_nil level.ideal_level_source
    assert_equal level.solution_blocks, level.ideal_level_source.data
  end
end
