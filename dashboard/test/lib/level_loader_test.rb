require 'test_helper'
require 'tmpdir'

class LevelLoaderTest < ActiveSupport::TestCase
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  # Values that live only inside a level's encrypted blob, so that finding them
  # in the database proves the seed path decrypted the file.
  SECRET_INSTRUCTIONS = 'only readable once decrypted'.freeze
  SECRET_NOTES = 'levelbuilder notes, also encrypted'.freeze
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

  test 'import_levels refuses level files misfiled across the UI Test partition' do
    fixture = Rails.root.join('test/fixtures/levels/Bee Fixture.level')
    prod_name_in_ui_test_tree = Rails.root.join('test/ui/config/levels/custom/LevelLoader misfiled probe.level')
    ui_test_name_in_prod_tree = Rails.root.join('config/levels/custom/UI Test LevelLoader misfiled probe.level')

    [prod_name_in_ui_test_tree, ui_test_name_in_prod_tree].each do |path|
      FileUtils.mkdir_p(File.dirname(path))
      FileUtils.cp(fixture, path)

      e = assert_raises do
        LevelLoader.import_levels path.relative_path_from(Rails.root).to_s
      end
      assert_includes e.message, 'misfiled'
    end
  ensure
    FileUtils.rm_f(prod_name_in_ui_test_tree)
    FileUtils.rm_f(ui_test_name_in_prod_tree)
  end

  test 'import_levels with an empty glob no-ops, unless a level was requested by name' do
    LevelLoader.import_levels 'test/fixtures/levels/no_such_directory/**/*.level'

    assert_raises do
      LevelLoader.import_levels 'test/fixtures/levels/No Such Level.level', level_name: 'No Such Level'
    end
  end

  test 'import_levels decrypts an encrypted level file into the database' do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    name = 'LevelLoader encrypted probe'
    Dir.mktmpdir do |dir|
      path = write_encrypted_level_file(dir, name)

      # Sanity-check the fixture: the secrets must not be readable on disk, or
      # the assertions below would pass without any decryption happening.
      contents = File.read(path)
      assert_includes contents, 'encrypted_properties'
      refute_includes contents, 'short_instructions'
      refute_includes contents, SECRET_INSTRUCTIONS
      refute_includes contents, SECRET_NOTES

      assert_nil Level.find_by_name(name)
      LevelLoader.import_levels path

      level = Level.find_by_name(name)
      refute_nil level
      assert_kind_of Artist, level
      assert level.encrypted
      # Everything in `properties` moves into the encrypted blob for an
      # encrypted level, so a seed that failed to decrypt would leave these nil.
      assert_equal SECRET_INSTRUCTIONS, level.short_instructions
      assert_equal SECRET_NOTES, level.notes
    end
  end

  test 'import_levels re-decrypts an encrypted level file when its contents change' do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    name = 'LevelLoader encrypted probe'
    Dir.mktmpdir do |dir|
      LevelLoader.import_levels write_encrypted_level_file(dir, name)
      assert_equal SECRET_INSTRUCTIONS, Level.find_by_name(name).short_instructions

      LevelLoader.import_levels write_encrypted_level_file(dir, name, short_instructions: 'second revision')
      assert_equal 'second revision', Level.find_by_name(name).short_instructions
    end
  end

  # Characterizes today's behavior, which is wrong: seeding an encrypted level
  # with no CDO.properties_encryption_key creates an empty stub *and* records
  # the file's md5, so Services::LevelFiles.load_custom_level short-circuits on
  # every later seed and the level stays empty even once a key is available.
  # The fix belongs with the code, not here; update this test when it lands.
  test 'import_levels without a key stubs out an encrypted level and records its md5' do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    name = 'LevelLoader encrypted probe'
    Dir.mktmpdir do |dir|
      path = write_encrypted_level_file(dir, name)

      CDO.stubs(:properties_encryption_key).returns(nil)
      LevelLoader.import_levels path

      level = Level.find_by_name(name)
      refute_nil level
      assert_nil level.short_instructions
      assert_equal Digest::MD5.hexdigest(File.read(path)), level.md5

      # Supplying the key later does not repair the level, because the md5 the
      # keyless seed stored still matches the file.
      CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
      LevelLoader.import_levels path
      assert_nil Level.find_by_name(name).short_instructions
    end
  end

  # Builds the .level file from Level#to_xml rather than a checked-in blob, so
  # the fixture stays valid if the serialization format moves and so it is
  # readable here. Returns the path written.
  def write_encrypted_level_file(dir, name, short_instructions: SECRET_INSTRUCTIONS)
    level = Artist.new(
      name: name,
      level_num: 'custom',
      encrypted: true,
      short_instructions: short_instructions,
      notes: SECRET_NOTES
    )
    path = File.join(dir, "#{name}.level")
    File.write(path, level.to_xml)
    path
  end
end
