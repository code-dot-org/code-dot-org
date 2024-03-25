require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/external_sources/sync_in'

describe I18n::Resources::Apps::ExternalSources::SyncIn do
  let(:described_class) {I18n::Resources::Apps::ExternalSources::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:process) {described_instance.process}

    it 'prepares i18n source files' do
      execution_sequence = sequence('execution')

      described_instance.expects(:prepare_blockly_core_files).in_sequence(execution_sequence)
      described_instance.expects(:prepare_ml_playground_file).in_sequence(execution_sequence)
      described_instance.expects(:prepare_dataset_files).in_sequence(execution_sequence)

      process
    end
  end

  describe '#prepare_blockly_core_files' do
    let(:prepare_blockly_core_files) {described_instance.send(:prepare_blockly_core_files)}

    let(:blockly_core_file_path) {CDO.dir('apps/node_modules/@code-dot-org/blockly/i18n/locales/en-US/core.json')}
    let(:i18n_source_dir_path) {CDO.dir('i18n/locales/source/blockly-core')}

    before do
      FileUtils.mkdir_p File.dirname(blockly_core_file_path)
      FileUtils.touch(blockly_core_file_path)
    end

    it 'prepares Blockly Core i18n source files' do
      I18nScriptUtils.expects(:copy_file).with(blockly_core_file_path, i18n_source_dir_path).once
      prepare_blockly_core_files
    end
  end

  describe '#prepare_ml_playground_file' do
    let(:prepare_ml_playground_file) {described_instance.send(:prepare_ml_playground_file)}

    let(:ml_playground_file_path) {CDO.dir('apps/node_modules/@code-dot-org/ml-playground/i18n/mlPlayground.json')}
    let(:i18n_source_dir_path) {CDO.dir('i18n/locales/source/external-sources/ml-playground')}

    it 'prepares ML-Playground i18n source file' do
      I18nScriptUtils.expects(:copy_file).with(ml_playground_file_path, i18n_source_dir_path).once
      prepare_ml_playground_file
    end
  end

  describe '#prepare_dataset_files' do
    let(:prepare_dataset_files) {described_instance.send(:prepare_dataset_files)}

    let(:dataset_id) {'expected_dataset_id'}
    let(:dataset_name) {'expected_dataset_name'}
    let(:dataset_card_desc) {'expected_dataset_card_desc'}
    let(:dataset_card_context_potential_uses) {'expected_dataset_card_context_potential_uses'}
    let(:dataset_card_context_potential_misuses) {'expected_dataset_card_context_potential_misuses'}
    let(:dataset_field_id) {'expected_dataset_field_id'}
    let(:dataset_field_desc) {'expected_dataset_field_desc)'}

    let(:dataset_manifest_file_path) {CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets-manifest.json')}
    let(:dataset_manifest_file_data) do
      {
        datasets: [
          {
            id: dataset_id,
            name: dataset_name,
          }
        ]
      }
    end

    let(:dataset_file_path) {CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets/dataset.json')}
    let(:dataset_file_data) do
      {
        name: dataset_id,
        card: {
          description: dataset_card_desc,
          context: {
            potentialUses: dataset_card_context_potential_uses,
            potentialMisuses: dataset_card_context_potential_misuses,
          }
        },
        fields: [
          {
            id: dataset_field_id,
            description: dataset_field_desc,
          },
        ]
      }
    end

    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/external-sources/ml-playground/datasets/dataset.json')}

    before do
      FileUtils.mkdir_p File.dirname(dataset_manifest_file_path)
      File.write dataset_manifest_file_path, JSON.dump(dataset_manifest_file_data)

      FileUtils.mkdir_p File.dirname(dataset_file_path)
      File.write dataset_file_path, JSON.dump(dataset_file_data)
    end

    it 'prepares ML-Playground dataset i18n source files' do
      expected_i18n_data = {
        'name' => dataset_name,
        'card' => {
          'description' => dataset_card_desc,
          'context' => {
            'potentialUses' => dataset_card_context_potential_uses,
            'potentialMisuses' => dataset_card_context_potential_misuses,
          },
        },
        'fields' => {
          dataset_field_id => {
            'id' => dataset_field_id,
            'description' => dataset_field_desc,
          },
        },
      }

      I18nScriptUtils.expects(:write_json_file).with(i18n_source_file_path, expected_i18n_data).once

      prepare_dataset_files
    end

    context 'when the dataset is not in the datasets manifest' do
      let(:dataset_manifest_file_data) do
        {
          datasets: [
            {
              id: '',
              name: '',
            }
          ]
        }
      end

      it 'prepares ML-Playground dataset i18n source files without dataset name' do
        expected_i18n_data = {
          'card' => {
            'description' => dataset_card_desc,
            'context' => {
              'potentialUses' => dataset_card_context_potential_uses,
              'potentialMisuses' => dataset_card_context_potential_misuses,
            },
          },
          'fields' => {
            dataset_field_id => {
              'id' => dataset_field_id,
              'description' => dataset_field_desc,
            },
          },
        }

        I18nScriptUtils.expects(:write_json_file).with(i18n_source_file_path, expected_i18n_data).once

        prepare_dataset_files
      end
    end
  end
end
