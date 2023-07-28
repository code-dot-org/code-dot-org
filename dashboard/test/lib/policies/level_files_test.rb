require 'test_helper'

module Policies
  class LevelFilesTest < ActiveSupport::TestCase
    test 'will provide a default if no file exists' do
      level_name = "Testing Default Level File"
      expected_file_path = Rails.root.join("config/scripts/levels/#{level_name}.level")
      refute File.exist?(expected_file_path)
      assert_equal Policies::LevelFiles.level_file_path(level_name), expected_file_path
    end

    test 'can find an existing level file from a variety of directories' do
      level_name = "Testing Existing Level Files"
      level_files = [
        # Check in the "default" location at the root of the levels dir
        "config/scripts/levels",
        # Also check nested and deeply-nested subdirectories of the levels dir
        "config/scripts/levels/foo",
        "config/scripts/levels/foo/bar/baz",
      ].map {|dir| Rails.root.join(dir, "#{level_name}.level").to_s}

      level_files.each do |level_file|
        FileUtils.mkdir_p(File.dirname(level_file))
        FileUtils.touch(level_file)
        assert_equal Policies::LevelFiles.level_file_path(level_name), level_file
        FileUtils.rm_f(level_file)
      end
    ensure
      # Make sure we clean up all touched level files, even if the test fails
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'will raise if multiple .level files found with the same name' do
      level_name = "Testing Multiple Level Files"
      level_files = [
        "config/scripts/levels",
        "config/scripts/levels/foo",
      ].map {|dir| Rails.root.join(dir, "#{level_name}.level").to_s}
      level_files.each do |level_file|
        FileUtils.mkdir_p(File.dirname(level_file))
        FileUtils.touch(level_file)
      end

      exception = assert_raises {Policies::LevelFiles.level_file_path(level_name)}
      assert_includes(exception.message, "Multiple .level files for '#{level_name}' found:")
      level_files.each {|level_file| assert_includes(exception.message, level_file)}
    ensure
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'will only write to file in levelbuilder mode' do
      writable_level = create(:level)
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)
      assert Policies::LevelFiles.write_to_file?(writable_level)
      Rails.application.config.stubs(:levelbuilder_mode).returns(false)
      refute Policies::LevelFiles.write_to_file?(writable_level)
    end

    test 'will only write certain levels to file' do
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)

      regular_level = create(:level)
      assert Policies::LevelFiles.write_to_file?(regular_level)

      dsl_defined_level = External.create(name: 'test writing to file')
      assert dsl_defined_level.is_a?(DSLDefined)
      refute Policies::LevelFiles.write_to_file?(dsl_defined_level)

      non_custom_level = create(:level, level_num: 'test_file_writing')
      refute non_custom_level.custom?
      refute Policies::LevelFiles.write_to_file?(non_custom_level)
    end
  end
end
