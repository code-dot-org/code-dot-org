require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/blocks'

class I18n::Resources::Dashboard::BlocksTest < Minitest::Test
  DASHBOARD_BLOCK_FIXTURE_PATH = CDO.dir('bin/test/fixtures/dashboard_config_block.json')

  def test_sync_in
    exec_seq = sequence('execution')

    I18n::Resources::Dashboard::Blocks.expects(:prepare).in_sequence(exec_seq)
    I18n::Resources::Dashboard::Blocks.expects(:redact).in_sequence(exec_seq)

    I18n::Resources::Dashboard::Blocks.sync_in
  end

  def test_preparation
    exec_seq = sequence('execution')

    expected_dashboard_block_json_files_path = CDO.dir('dashboard/config/blocks/**/*.json')
    expected_dashboard_blocks_i18n_file_path = CDO.dir('dashboard/config/locales/blocks.en.yml')
    expected_i18n_source_dashboard_dir_path = CDO.dir('i18n/locales/source/dashboard')
    expected_i18n_source_dashboard_blocks_file_path = CDO.dir('i18n/locales/source/dashboard/blocks.yml')

    expected_translation_yaml = 'expected_translation_yaml'
    expected_translation_data = {
      'dashboard_config_block' => {
        'text' => '{TEST_TYPE} | {TEST_OPTIONS_1} | {TEST_OPTIONS_1}',
        'options' => {
          'TEST_OPTIONS_1' => {'"Test_1"' => 'Test_1'},
          'TEST_OPTIONS_2' => {'"Test_2"' => 'Test_2'}
        }
      }
    }

    Dir.stubs(:[]).with(expected_dashboard_block_json_files_path).returns([DASHBOARD_BLOCK_FIXTURE_PATH])
    I18nScriptUtils.stubs(:to_crowdin_yaml).with({'en' => {'data' => {'blocks' => expected_translation_data}}}).returns(expected_translation_yaml)

    File.expects(:write).with(expected_dashboard_blocks_i18n_file_path, expected_translation_yaml).in_sequence(exec_seq)
    FileUtils.expects(:mkdir_p).with(expected_i18n_source_dashboard_dir_path).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(expected_dashboard_blocks_i18n_file_path, expected_i18n_source_dashboard_blocks_file_path).in_sequence(exec_seq)

    I18n::Resources::Dashboard::Blocks.prepare
  end

  def test_redaction
    exec_seq = sequence('execution')

    expected_source_file_path = CDO.dir('i18n/locales/source/dashboard/blocks.yml')
    expected_backup_file_path = CDO.dir('i18n/locales/original/dashboard/blocks.yml')
    expected_backup_dir_path = CDO.dir('i18n/locales/original/dashboard')

    FileUtils.expects(:mkdir_p).with(expected_backup_dir_path).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(expected_source_file_path, expected_backup_file_path).in_sequence(exec_seq)
    RedactRestoreUtils.expects(:redact).with(expected_source_file_path, expected_source_file_path, %w[blockfield], 'txt').in_sequence(exec_seq)

    I18n::Resources::Dashboard::Blocks.redact
  end
end
