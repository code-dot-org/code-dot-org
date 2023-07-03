require_relative '../test_helper'
require_relative '../../i18n/redact_restore_utils'

class RedactRestoreUtilsTest < Minitest::Test
  I18N_BLOCKS_FIXTURE_PATH = CDO.dir('bin/test/fixtures/i18n_locales_source_dashboard_blocks.yml')

  def test_redaction_of_json_data_with_blockfield_plugin_and_txt_format
    expected_source_data = YAML.load_file(I18N_BLOCKS_FIXTURE_PATH)
    expected_plugins = %w[blockfield]
    expected_format = 'txt'

    expected_result = {
      'en' => {
        'data' => {
          'blocks' => {
            'dashboard_config_blocks' => {
              'text' => "[TEST_TYPE][0] | [TEST_OPTIONS_1][1] | [TEST_OPTIONS_1][2]",
              'options' => {
                'TEST_OPTIONS_1' => {
                  '"Test_1"' => 'Test_1'
                },
                'TEST_OPTIONS_2' => {
                  '"Test_2"' => "Test_2"
                }
              }
            }
          }
        }
      }
    }

    assert_equal expected_result, RedactRestoreUtils.redact_data(expected_source_data, expected_plugins, expected_format)
  end

  def test_redaction_of_json_file_with_blockfield_plugin_and_txt_format
    expected_source_path = I18N_BLOCKS_FIXTURE_PATH
    expected_source_data = 'expected_source_data'
    expected_dest_dir_path = 'expected_dest_dir'
    expected_dest_path = "#{expected_dest_dir_path}/dest.yml"
    expected_dest_file = mock
    expected_plugins = %w[blockfield]
    expected_format = 'txt'
    expected_redacted_data = 'expected_redacted_data'
    expected_redacted_yaml = 'expected_redacted_yaml'

    FileUtils.expects(:mkdir_p).with(expected_dest_dir_path).once

    YAML.stubs(:load_file).with(expected_source_path).returns(expected_source_data)
    RedactRestoreUtils.stubs(:redact_data).with(expected_source_data, expected_plugins, expected_format).returns(expected_redacted_data)

    File.stubs(:open).with(expected_dest_path, 'w+').yields(expected_dest_file)
    I18nScriptUtils.stubs(:to_crowdin_yaml).returns(expected_redacted_yaml)
    expected_dest_file.expects(:write).with(expected_redacted_yaml).once

    RedactRestoreUtils.redact(expected_source_path, expected_dest_path, expected_plugins, expected_format)
  end
end
