require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/blocks/sync_in'

describe I18n::Resources::Dashboard::Blocks::SyncIn do
  let(:sync_in) {I18n::Resources::Dashboard::Blocks::SyncIn.new}

  let(:origin_i18n_file_path) {CDO.dir('dashboard/config/locales/blocks.en.yml')}
  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/blocks.yml')}
  let(:i18n_original_file_path) {CDO.dir('i18n/locales/original/dashboard/blocks.yml')}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Dashboard::Blocks::SyncIn.any_instance.expects(:execute).once

      I18n::Resources::Dashboard::Blocks::SyncIn.perform
    end
  end

  describe '#execute' do
    let(:execute_sync_in) {sync_in.execute}

    it 'prepares and then redacts the i18n source file' do
      execution_sequence = sequence('execution')

      sync_in.expects(:prepare).in_sequence(execution_sequence)
      sync_in.expects(:redact).in_sequence(execution_sequence)

      execute_sync_in
    end
  end

  describe '#blocks_data' do
    let(:blocks_data) {sync_in.send(:blocks_data)}

    let(:block_file_path) {CDO.dir('dashboard/config/blocks/expected_block_name.json')}
    let(:block_file_data) do
      {
        category: 'TestCategory',
        config: {
          func: 'testFunc',
          blockText: '{TEST_TYPE} | {TEST_OPTIONS_1} | {TEST_OPTIONS_1}',
          args: [
            {
              name: 'TEST_TYPE',
              type: 'TestType'
            },
            {
              name: 'TEST_OPTIONS_1',
              options: [['Test_1', '"Test_1"']]
            },
            {
              name: 'TEST_OPTIONS_2',
              options: [['Test_2', '"Test_2"']]
            }
          ]
        }
      }
    end
    let(:expected_blocks_data) do
      {
        'expected_block_name' => {
          'text' => '{TEST_TYPE} | {TEST_OPTIONS_1} | {TEST_OPTIONS_1}',
          'options' => {
            'TEST_OPTIONS_1' => {'"Test_1"' => 'Test_1'},
            'TEST_OPTIONS_2' => {'"Test_2"' => 'Test_2'}
          }
        }
      }
    end

    before do
      FileUtils.mkdir_p(File.dirname(block_file_path))
      File.write(block_file_path, JSON.dump(block_file_data))
    end

    it 'returns correct blocks data' do
      assert_equal expected_blocks_data, blocks_data
    end
  end

  describe '#i18n_data' do
    let(:i18n_data) {sync_in.send(:i18n_data)}

    it 'returns correct i18n data' do
      expected_blocks_data = 'expected_blocks_data'

      sync_in.expects(:blocks_data).once.returns(expected_blocks_data)

      assert_equal({'en' => {'data' => {'blocks' => expected_blocks_data}}}, i18n_data)
    end
  end

  describe '#prepare' do
    let(:prepare_i18n_source_file) {sync_in.send(:prepare)}

    let(:expected_i18n_data) {'expected_i18n_data'}
    let(:expected_i18n_yaml) {'expected_i18n_yaml'}

    before do
      sync_in.expects(:i18n_data).once.returns(expected_i18n_data)
      I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_i18n_data).once.returns(expected_i18n_yaml)
    end

    it 'updates the origin i18n file' do
      prepare_i18n_source_file

      assert File.exist?(origin_i18n_file_path)
      assert_equal expected_i18n_yaml, YAML.load_file(origin_i18n_file_path)
    end

    it 'prepares the i18n source file' do
      prepare_i18n_source_file

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_yaml, YAML.load_file(i18n_source_file_path)
    end
  end

  describe '#redact' do
    let(:redact_i18n_source_file) {sync_in.send(:redact)}

    it 'creates a backup and then redacts the i18n source file' do
      execution_sequence = sequence('execution')

      I18nScriptUtils.expects(:copy_file).with(i18n_source_file_path, i18n_original_file_path).in_sequence(execution_sequence)
      RedactRestoreUtils.expects(:redact).with(i18n_source_file_path, i18n_source_file_path, %w[blockfield], 'txt').in_sequence(execution_sequence)

      redact_i18n_source_file
    end
  end
end
