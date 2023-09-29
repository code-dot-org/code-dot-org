require 'test_helper'

module Policies
  class LevelFilesTest < ActiveSupport::TestCase
    test 'will provide a default if no file exists' do
      regular_level = create(:level)
      expected_file_path = Rails.root.join(
        'config/levels/custom',
        regular_level.game.app,
        "#{regular_level.name}.level"
      )
      refute(File.exist?(expected_file_path))
      assert_equal(Policies::LevelFiles.level_file_path(regular_level), expected_file_path)

      # can also provide a default for gameless levels, even though the regular
      # path includes the game name
      gameless_level = create(:level, game: nil)
      expected_file_path = Rails.root.join("config/levels/custom/#{gameless_level.name}.level")
      refute(File.exist?(expected_file_path))
      assert_equal(Policies::LevelFiles.level_file_path(gameless_level), expected_file_path)
    end

    test 'can find an existing level file from a variety of directories' do
      level = create(:level)
      level_files = [
        # Check in the old default location
        'config/scripts/levels',
        # Check in the new default location
        'config/levels/custom',
        # Also check nested and deeply-nested subdirectories
        'config/scripts/levels/foo',
        'config/scripts/levels/foo/bar/baz',
        'config/levels/custom/foo',
        'config/levels/custom/foo/bar/baz',
      ].map {|dir| Rails.root.join(dir, "#{level.name}.level")}

      level_files.each do |level_file|
        FileUtils.mkdir_p(File.dirname(level_file))
        FileUtils.touch(level_file)
        assert_equal(Policies::LevelFiles.level_file_path(level), level_file)
        FileUtils.rm_f(level_file)
      end
    ensure
      # Make sure we clean up all touched level files, even if the test fails
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'will raise if multiple .level files found with the same name' do
      level = create(:level)
      level_files = [
        'config/scripts/levels',
        'config/levels/custom',
      ].map {|dir| Rails.root.join(dir, "#{level.name}.level").to_s}
      level_files.each do |level_file|
        FileUtils.mkdir_p(File.dirname(level_file))
        FileUtils.touch(level_file)
      end

      exception = assert_raises {Policies::LevelFiles.level_file_path(level)}
      assert_includes(exception.message, "Multiple .level files for '#{level.name}' found:")
      level_files.each {|level_file| assert_includes(exception.message, level_file)}
    ensure
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'will only write to file in levelbuilder mode' do
      writable_level = create(:level)
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)
      assert(Policies::LevelFiles.write_to_file?(writable_level))
      Rails.application.config.stubs(:levelbuilder_mode).returns(false)
      refute(Policies::LevelFiles.write_to_file?(writable_level))
    end

    test 'will only write certain levels to file' do
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)

      regular_level = create(:level)
      assert(Policies::LevelFiles.write_to_file?(regular_level))

      dsl_defined_level = External.create
      assert(dsl_defined_level.is_a?(DSLDefined))
      refute(Policies::LevelFiles.write_to_file?(dsl_defined_level))

      non_custom_level = create(:level, level_num: 'test_file_writing')
      refute(non_custom_level.custom?)
      refute(Policies::LevelFiles.write_to_file?(non_custom_level))
    end
  end
end
