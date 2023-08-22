require_relative '../test_helper'
require_relative '../../i18n/i18n_script_utils'

class I18nScriptUtilsTest < Minitest::Test
  def test_crowdin_projects
    assert_equal %i[codeorg codeorg-markdown hour-of-code codeorg-restricted], CROWDIN_PROJECTS.keys
  end

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

    expected_content_dir         = CDO.dir('i18n/locales/source/expected_content_dir')
    expected_unit_i18n_filename  = 'expected_unit_i18n.json'
    expected_unit_i18n_filepath1 = CDO.dir('i18n/locales/source/expected_content_dir/1/expected_unit_i18n.json')
    expected_unit_i18n_filepath2 = CDO.dir('i18n/locales/source/expected_content_dir/2/expected_unit_i18n.json')

    Dir.expects(:glob).with(File.join(expected_content_dir, '**', expected_unit_i18n_filename)).in_sequence(exec_seq).returns([expected_unit_i18n_filepath2])
    I18nScriptUtils.expects(:log_error).with(
      'Destination directory for unit is attempting to change',
      'Unit expected wants to output strings to 1/expected_unit_i18n.json, but 2/expected_unit_i18n.json already exists'
    ).in_sequence(exec_seq)

    assert I18nScriptUtils.unit_directory_change?(expected_content_dir, expected_unit_i18n_filename, expected_unit_i18n_filepath1)
  end

  def test_unit_directory_changing_when_no_matching_files
    expected_content_dir        = CDO.dir('i18n/locales/source/expected_content_dir')
    expected_unit_i18n_filename = 'expected_unit_i18n.json'
    expected_unit_i18n_filepath = CDO.dir('i18n/locales/source/expected_content_dir/expected_unit_i18n.json')

    Dir.expects(:glob).with(File.join(expected_content_dir, '**', expected_unit_i18n_filename)).once.returns([expected_unit_i18n_filepath])

    refute I18nScriptUtils.unit_directory_change?(expected_content_dir, expected_unit_i18n_filename, expected_unit_i18n_filepath)
  end

  def test_yml_file_fixing
    provided_yaml_file_path = 'provided_yaml_file_path'

    File.expects(:read).with(provided_yaml_file_path).returns("---\nen-US:\n  data\n")
    File.expects(:write).with(provided_yaml_file_path, %Q["en-US":\n  data\n])

    I18nScriptUtils.fix_yml_file(provided_yaml_file_path)
  end
end
