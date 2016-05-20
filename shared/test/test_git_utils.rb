# coding: utf-8
require_relative 'test_helper'

require 'cdo/git_utils'

class GitUtilsTest < Minitest::Test
  FUNKY_FILE_NAME = 'a_funky-file name.js'

  def test_glob_matches_file_names
    assert GitUtils.glob_matches_file_path?('file.js', 'file.js')
    assert !GitUtils.glob_matches_file_path?('*/file.js', 'file.js')
    assert GitUtils.glob_matches_file_path?('**/file.js', 'file.js')

    assert GitUtils.glob_matches_file_path?('*.js', 'file.js')
    assert GitUtils.glob_matches_file_path?('**.js', 'file.js')

    assert GitUtils.glob_matches_file_path?(FUNKY_FILE_NAME, FUNKY_FILE_NAME)
    assert GitUtils.glob_matches_file_path?('*.js', FUNKY_FILE_NAME)
    assert GitUtils.glob_matches_file_path?('**.js', FUNKY_FILE_NAME)
  end

  def test_glob_matches_nested_files
    assert GitUtils.glob_matches_file_path?('**/*.js', './file.js')
    assert GitUtils.glob_matches_file_path?('**/*.js', 'file.js')
    assert GitUtils.glob_matches_file_path?('**/*.js', 'folder/file.js')
    assert GitUtils.glob_matches_file_path?('**/*.js', 'nested/folder/file.js')

    assert !GitUtils.glob_matches_file_path?('*.js', 'nested/folder/file.js')
  end

  def test_glob_mismatches_extensions
    assert !GitUtils.glob_matches_file_path?('*.jsx', 'file.js')
    assert !GitUtils.glob_matches_file_path?('*.js', 'file.jsx')
    assert !GitUtils.glob_matches_file_path?('**/*.jsx', 'nested/folder/file.js')
    assert !GitUtils.glob_matches_file_path?('**/*.js', 'nested/folder/file.jsx')

    assert !GitUtils.glob_matches_file_path?('**.jsx', 'nested/folder/file.js')
    assert !GitUtils.glob_matches_file_path?('**.js', 'nested/folder/file.jsx')
  end

  def test_glob_folder_wide_changes
    assert GitUtils.glob_matches_file_path?('blockly-core/*', 'blockly-core/test.js')
    assert !GitUtils.glob_matches_file_path?('blockly-core/*', 'blockly-core/nested/test.js')
    assert GitUtils.glob_matches_file_path?('blockly-core/**/*', 'blockly-core/nested/test.js')
  end
end
