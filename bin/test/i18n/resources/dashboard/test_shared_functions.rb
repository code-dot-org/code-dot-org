require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/shared_functions'

class I18n::Resources::Dashboard::SharedFunctionsTest < Minitest::Test
  def test_sync_in
    expected_shared_functions_data = {
      'en' => {
        'data' => {
          'shared_functions' => {
            'shared-function-1' => 'shared-function-1',
            'shared-function-2' => 'shared-function-2'
          }
        }
      }
    }
    expected_sync_in_result_file_path = CDO.dir('i18n/locales/source/dashboard/shared_functions.yml')
    expected_sync_in_result_file_data = 'expected_sync_in_result_file_data'

    I18nScriptUtils.stubs(:to_crowdin_yaml).with(expected_shared_functions_data).returns(expected_sync_in_result_file_data)
    SharedBlocklyFunction.any_instance.stubs(:write_file)

    SharedBlocklyFunction.transaction do
      SharedBlocklyFunction.delete_all

      FactoryBot.create(:shared_blockly_function, level_type: 'GamelabJr', name: 'shared-function-2')
      FactoryBot.create(:shared_blockly_function, level_type: 'Unexpected', name: 'unexpected')
      FactoryBot.create(:shared_blockly_function, level_type: 'GamelabJr', name: 'shared-function-1')

      File.expects(:write).with(expected_sync_in_result_file_path, expected_sync_in_result_file_data).once

      I18n::Resources::Dashboard::SharedFunctions.sync_in
    ensure
      raise ActiveRecord::Rollback
    end
  end
end
