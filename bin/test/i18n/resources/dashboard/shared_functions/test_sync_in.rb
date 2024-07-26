require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/shared_functions/sync_in'

describe I18n::Resources::Dashboard::SharedFunctions::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::SharedFunctions::SyncIn}
  let(:described_instance) {described_class.new}

  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/shared_functions.yml')}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:run_process) {described_instance.process}

    let(:shared_function_1_name) {'expected-shared-function-1'}
    let(:shared_function_2_name) {'expected-shared-function-2'}

    before do
      SharedBlocklyFunction.destroy_all

      FactoryBot.create(:shared_blockly_function, level_type: 'GamelabJr', name: shared_function_2_name)
      FactoryBot.create(:shared_blockly_function, level_type: 'Unexpected', name: 'unexpected-shared-function')
      FactoryBot.create(:shared_blockly_function, level_type: 'GamelabJr', name: shared_function_1_name)
    end

    it 'prepares the i18n source file' do
      expected_i18n_source_file_content = <<~YAML
        ---
        en:
          data:
            shared_functions:
              #{shared_function_1_name}: #{shared_function_1_name}
              #{shared_function_2_name}: #{shared_function_2_name}
      YAML

      run_process

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_source_file_content, File.read(i18n_source_file_path)
    end
  end
end
