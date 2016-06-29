# coding: utf-8
require_relative 'test_helper'

require 'cdo/rake_utils'

class RakeUtilsTest < Minitest::Test
  FUNKY_FILE_NAME = 'a_funky-file name.js'
  TEST_OUTPUT_DIR = './output'
  TEST_YML_FILE = "#{TEST_OUTPUT_DIR}/yml_update.yml"

  def test_glob_matches_file_names
    assert RakeUtils.glob_matches_file_path?('file.js', 'file.js')
    assert !RakeUtils.glob_matches_file_path?('*/file.js', 'file.js')
    assert RakeUtils.glob_matches_file_path?('**/file.js', 'file.js')

    assert RakeUtils.glob_matches_file_path?('*.js', 'file.js')
    assert RakeUtils.glob_matches_file_path?('**.js', 'file.js')

    assert RakeUtils.glob_matches_file_path?(FUNKY_FILE_NAME, FUNKY_FILE_NAME)
    assert RakeUtils.glob_matches_file_path?('*.js', FUNKY_FILE_NAME)
    assert RakeUtils.glob_matches_file_path?('**.js', FUNKY_FILE_NAME)
  end

  def test_glob_matches_nested_files
    assert RakeUtils.glob_matches_file_path?('**/*.js', './file.js')
    assert RakeUtils.glob_matches_file_path?('**/*.js', 'file.js')
    assert RakeUtils.glob_matches_file_path?('**/*.js', 'folder/file.js')
    assert RakeUtils.glob_matches_file_path?('**/*.js', 'nested/folder/file.js')

    assert !RakeUtils.glob_matches_file_path?('*.js', 'nested/folder/file.js')
  end

  def test_glob_mismatches_extensions
    assert !RakeUtils.glob_matches_file_path?('*.jsx', 'file.js')
    assert !RakeUtils.glob_matches_file_path?('*.js', 'file.jsx')
    assert !RakeUtils.glob_matches_file_path?('**/*.jsx', 'nested/folder/file.js')
    assert !RakeUtils.glob_matches_file_path?('**/*.js', 'nested/folder/file.jsx')

    assert !RakeUtils.glob_matches_file_path?('**.jsx', 'nested/folder/file.js')
    assert !RakeUtils.glob_matches_file_path?('**.js', 'nested/folder/file.jsx')
  end

  def test_glob_folder_wide_changes
    assert RakeUtils.glob_matches_file_path?('blockly-core/*', 'blockly-core/test.js')
    assert !RakeUtils.glob_matches_file_path?('blockly-core/*', 'blockly-core/nested/test.js')
    assert RakeUtils.glob_matches_file_path?('blockly-core/**/*', 'blockly-core/nested/test.js')
  end

  def test_yml_update_updates_empty_file
    FileUtils.mkdir_p(TEST_OUTPUT_DIR)
    File.new(TEST_YML_FILE, 'w')

    RakeUtils.update_yml(TEST_YML_FILE) do |hash|
      hash['a'] = 'b'
      hash['b'] = true
      hash['c'] = 5
    end

    re_loaded_hash = YAML.load_file(TEST_YML_FILE)
    assert_equal 'b', re_loaded_hash['a']
    assert_equal true, re_loaded_hash['b']
    assert_equal 5, re_loaded_hash['c']
  ensure
    File.delete(TEST_YML_FILE)
  end

  def test_yml_update_updates_existing_values
    FileUtils.mkdir_p(TEST_OUTPUT_DIR)
    File.open(TEST_YML_FILE, 'w') { |f| YAML.dump({'a' => 1, 'b' => 2}, f) }

    RakeUtils.update_yml(TEST_YML_FILE) do |hash|
      hash['b'] = 3
    end

    re_loaded_hash = YAML.load_file(TEST_YML_FILE)
    assert_equal 1, re_loaded_hash['a']
    assert_equal 3, re_loaded_hash['b']
  ensure
    File.delete(TEST_YML_FILE)
  end
end
