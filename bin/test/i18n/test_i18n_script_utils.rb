require_relative '../test_helper'
require_relative '../../i18n/i18n_script_utils'

class I18nScriptUtilsTest < Minitest::Test
  def test_to_crowdin_yaml
    assert_equal "---\n:en:\n  test: \"#example\"\n  'yes': 'y'\n", I18nScriptUtils.to_crowdin_yaml({en: {'test' => '#example', 'yes' => 'y'}})
  end

  def test_header_sanitization
    header = {'title' => 'Expects only title', 'invalid' => 'Unexpected header'}

    I18nScriptUtils.sanitize_header!(header)

    assert_equal({'title' => 'Expects only title'}, header)
  end

  def test_markdown_with_header_writing
    exec_seq = sequence('execution')

    expected_markdown = 'expected_markdown'
    expected_header   = {'expected' => 'header'}
    expected_filepath = 'expected_filepath'
    expected_file     = stub('expected_file')

    File.expects(:open).with(expected_filepath, 'w').yields(expected_file).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_header).returns('expected_header_crowdin_yaml').in_sequence(exec_seq)
    expected_file.expects(:write).with('expected_header_crowdin_yaml').in_sequence(exec_seq)
    expected_file.expects(:write).with("---\n\n").in_sequence(exec_seq)
    expected_file.expects(:write).with(expected_markdown).in_sequence(exec_seq)

    I18nScriptUtils.write_markdown_with_header(expected_markdown, expected_header, expected_filepath)
  end

  def test_markdown_with_header_writing_when_header_is_empty
    exec_seq = sequence('execution')

    expected_markdown = 'expected_markdown'
    expected_header   = {}
    expected_filepath = 'expected_filepath'
    expected_file     = stub('expected_file')

    File.expects(:open).with(expected_filepath, 'w').yields(expected_file).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_header).never
    expected_file.expects(:write).with("---\n\n").never
    expected_file.expects(:write).with(expected_markdown).in_sequence(exec_seq)

    I18nScriptUtils.write_markdown_with_header(expected_markdown, expected_header, expected_filepath)
  end

  def test_error_logging
    expected_error_class = 'expected_error_class'
    expected_error_message = 'expected_error_message'

    I18nScriptUtils.expects(:puts).with('[expected_error_class] expected_error_message').once

    I18nScriptUtils.log_error(expected_error_class, expected_error_message)
  end

  def test_unit_directory_changing
    exec_seq = sequence('execution')

    expected_file_name = 'expected.json'
    expected_file1_path = CDO.dir('i18n/locales/source/course_content/1/expected.json')
    expected_file2_path = CDO.dir('i18n/locales/source/course_content/2/expected.json')

    Dir.expects(:glob).with(CDO.dir('i18n/locales/source/course_content/**/expected.json')).in_sequence(exec_seq).returns([expected_file2_path])
    I18nScriptUtils.expects(:log_error).with(
      'Destination directory for script is attempting to change',
      'Script expected wants to output strings to 1/expected.json, but 2/expected.json already exists'
    ).in_sequence(exec_seq)

    assert I18nScriptUtils.unit_directory_change?(expected_file_name, expected_file1_path)
  end

  def test_unit_directory_changing_when_no_matching_files
    expected_file_name = 'expected.json'
    expected_file_path = 'i18n/locales/source/course_content/expected.json'

    Dir.expects(:glob).with(CDO.dir('i18n/locales/source/course_content/**/expected.json')).once.returns([expected_file_path])

    refute I18nScriptUtils.unit_directory_change?(expected_file_name, expected_file_path)
  end
end
