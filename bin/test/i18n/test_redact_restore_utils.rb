require_relative '../test_helper'
require_relative '../../i18n/redact_restore_utils'

class RedactRestoreUtilsTest < Minitest::Test
  YAML_FIXTURE_PATH = CDO.dir('bin/test/fixtures/i18n_locales_source_dashboard_blocks.yml').freeze
  JSON_FIXTURE_PATH = CDO.dir('bin/test/fixtures/i18n_locales_source_dashboard_docs.json').freeze

  def test_redaction_of_yaml_file
    expected_source_path = YAML_FIXTURE_PATH
    expected_source_data = 'expected_source_data'
    expected_dest_dir_path = 'expected_dest_dir'
    expected_dest_path = "#{expected_dest_dir_path}/dest.yml"
    expected_dest_file = mock
    expected_plugins = %w[testPlugin]
    expected_format = 'txt'
    expected_redacted_data = 'expected_redacted_data'
    expected_redacted_yaml = 'expected_redacted_yaml'

    YAML.stubs(:load_file).with(expected_source_path).returns(expected_source_data)
    RedactRestoreUtils.stubs(:redact_data).with(expected_source_data, expected_plugins, expected_format).returns(expected_redacted_data)

    File.stubs(:open).with(expected_dest_path, 'w+').yields(expected_dest_file)
    I18nScriptUtils.stubs(:to_crowdin_yaml).returns(expected_redacted_yaml)

    FileUtils.expects(:mkdir_p).with(expected_dest_dir_path).once
    expected_dest_file.expects(:write).with(expected_redacted_yaml).once

    RedactRestoreUtils.redact(expected_source_path, expected_dest_path, expected_plugins, expected_format)
  end

  def test_redaction_of_json_file
    expected_source_path = JSON_FIXTURE_PATH
    expected_source_data = 'expected_source_data'
    expected_dest_dir_path = 'expected_dest_dir'
    expected_dest_path = "#{expected_dest_dir_path}/dest.json"
    expected_dest_file = mock
    expected_plugins = %w[testPlugin]
    expected_format = 'txt'
    expected_redacted_data = 'expected_redacted_data'
    expected_redacted_json = '"expected_redacted_data"'

    JSON.stubs(:load_file).with(expected_source_path).returns(expected_source_data)
    RedactRestoreUtils.stubs(:redact_data).with(expected_source_data, expected_plugins, expected_format).returns(expected_redacted_data)
    File.stubs(:open).with(expected_dest_path, 'w+').yields(expected_dest_file)

    FileUtils.expects(:mkdir_p).with(expected_dest_dir_path).once
    expected_dest_file.expects(:write).with(expected_redacted_json).once

    RedactRestoreUtils.redact(expected_source_path, expected_dest_path, expected_plugins, expected_format)
  end

  def test_redaction_of_data_with_blockfield_plugin_with_txt_format
    raw_redact_data = {'test' => "{TEST} \n {EXAMPLE}"}
    expected_result = {'test' => "[TEST][0] \n [EXAMPLE][1]"}

    assert_equal expected_result, RedactRestoreUtils.redact_data(raw_redact_data, %w[blockfield], 'txt')
  end

  def test_redaction_of_data_with_visual_code_block_plugin
    raw_redact_data = {'test' => "\r\n - *test* - \n"}
    expected_result = {'test' => "-   _test_ - "}

    assert_equal expected_result, RedactRestoreUtils.redact_data(raw_redact_data, %w[visualCodeBlock])
  end

  def test_redaction_of_data_with_link_plugin
    raw_redact_data = {'test' => '[link](https://example.org)'}
    expected_result = {'test' => '[link][0]'}

    assert_equal expected_result, RedactRestoreUtils.redact_data(raw_redact_data, %w[link])
  end

  def test_redaction_of_data_with_resource_link_plugin
    raw_redact_data = {'valid' => '[r test/example/1]', 'invalid' => '[r test/example]'}
    expected_result = {'valid' => '[test][0]', 'invalid' => '[r test/example]'}

    assert_equal expected_result, RedactRestoreUtils.redact_data(raw_redact_data, %w[resourceLink])
  end

  def test_redaction_of_data_with_vocabulary_definition_plugin
    raw_redact_data = {'valid' => '[v test/example/1]', 'invalid' => '[v test/example]'}
    expected_result = {'valid' => '[test][0]', 'invalid' => '[v test/example]'}

    assert_equal expected_result, RedactRestoreUtils.redact_data(raw_redact_data, %w[vocabularyDefinition])
  end
end
