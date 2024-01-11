require_relative 'test_helper'

require 'cdo/rake_utils'

class RakeUtilsTest < Minitest::Test
  FUNKY_FILE_NAME = 'a_funky-file name.js'.freeze

  def test_glob_matches_file_names
    assert RakeUtils.glob_matches_file_path?('file.js', 'file.js')
    refute RakeUtils.glob_matches_file_path?('*/file.js', 'file.js')
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

    refute RakeUtils.glob_matches_file_path?('*.js', 'nested/folder/file.js')
  end

  def test_glob_mismatches_extensions
    refute RakeUtils.glob_matches_file_path?('*.jsx', 'file.js')
    refute RakeUtils.glob_matches_file_path?('*.js', 'file.jsx')
    refute RakeUtils.glob_matches_file_path?('**/*.jsx', 'nested/folder/file.js')
    refute RakeUtils.glob_matches_file_path?('**/*.js', 'nested/folder/file.jsx')

    refute RakeUtils.glob_matches_file_path?('**.jsx', 'nested/folder/file.js')
    refute RakeUtils.glob_matches_file_path?('**.js', 'nested/folder/file.jsx')
  end
end
