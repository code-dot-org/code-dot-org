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
end
