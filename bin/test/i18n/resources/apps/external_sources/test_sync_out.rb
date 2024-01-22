require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/external_sources/sync_out'

describe I18n::Resources::Apps::ExternalSources::SyncOut do
  let(:described_class) {I18n::Resources::Apps::ExternalSources::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'uk-UA'}
  let(:js_locale) {'uk_ua'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}
  let(:is_source_language) {false}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    I18nScriptUtils.stubs(:source_lang?).with(language).returns(is_source_language)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    it 'distributes external sources localization files' do
      execution_sequence = sequence('execution')

      described_instance.expects(:distribute_ml_playground).with(language).in_sequence(execution_sequence)
      described_instance.expects(:distribute_blockly_core).with(language).in_sequence(execution_sequence)

      process_language
    end
  end

  describe '#distribute_ml_playground' do
    let(:distribute_ml_playground_l10n) {described_instance.send(:distribute_ml_playground, language)}

    let(:ml_playground_i18n_data) do
      {
        'ml_playground_i18n_key' => 'ml_playground_i18n_val',
      }
    end
    let(:dataset_id) {'expected_dataset_id'}
    let(:dataset_i18n_data) {{'dataset_i18n_key' => 'dataset_i18n_val'}}
    let(:datasets_i18n_data) do
      {
        'datasets' => {
          dataset_id => dataset_i18n_data
        }
      }
    end

    let(:target_i18n_file_path) {CDO.dir("apps/i18n/mlPlayground/#{js_locale}.json")}
    let(:target_i18n_file_data) do
      {
        **ml_playground_i18n_data,
        **datasets_i18n_data,
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(target_i18n_file_path)
      File.write target_i18n_file_path, JSON.dump(target_i18n_file_data)
    end

    describe 'ml-playground localization distribution' do
      let(:crowdin_ml_playground_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'external-sources/ml-playground/mlPlayground.json')}
      let(:crowdin_ml_playground_file_data) do
        {
          'ml_playground_i18n_key' => 'new_ml_playground_i18n_val'
        }
      end

      before do
        FileUtils.mkdir_p File.dirname(crowdin_ml_playground_file_path)
        File.write crowdin_ml_playground_file_path, JSON.dump(crowdin_ml_playground_file_data)
      end

      it 'distributes ML Playground localization' do
        execution_sequence = sequence('execution')

        expected_i18n_data = {
          **crowdin_ml_playground_file_data,
          **datasets_i18n_data,
        }

        I18nScriptUtils.expects(:sanitize_data_and_write).with(expected_i18n_data, target_i18n_file_path).in_sequence(execution_sequence)
        I18nScriptUtils.expects(:rename_dir).with(
          CDO.dir('i18n/locales', crowdin_locale, 'external-sources/ml-playground'),
          CDO.dir('i18n/locales', i18n_locale, 'external-sources/ml-playground')
        ).in_sequence(execution_sequence)
        I18nScriptUtils.expects(:remove_empty_dir).with(
          CDO.dir('i18n/locales', crowdin_locale, 'external-sources')
        ).in_sequence(execution_sequence)

        distribute_ml_playground_l10n
      end

      context 'when the target i18n file does not exist' do
        before do
          FileUtils.rm(target_i18n_file_path)
        end

        it 'distributes ML Playground localization without datasets' do
          expected_i18n_data = crowdin_ml_playground_file_data

          I18nScriptUtils.expects(:sanitize_data_and_write).with(expected_i18n_data, target_i18n_file_path).once

          distribute_ml_playground_l10n
        end
      end

      context 'when the Crowdin i18n file does not exist' do
        before do
          FileUtils.rm(crowdin_ml_playground_file_path)
        end

        it 'does not distribute ML Playground localization' do
          I18nScriptUtils.expects(:sanitize_data_and_write).with(anything, target_i18n_file_path).never
          distribute_ml_playground_l10n
        end
      end

      context 'when the language is the source language' do
        let(:is_source_language) {true}

        it 'does not distribute ML Playground localization' do
          I18nScriptUtils.expects(:sanitize_data_and_write).with(anything, target_i18n_file_path).never
          distribute_ml_playground_l10n
        end
      end
    end

    describe 'ml-playground dataset localizations distribution' do
      let(:crowdin_dataset_file_path) {CDO.dir('i18n/locales', crowdin_locale, "external-sources/ml-playground/datasets/#{dataset_id}.json")}
      let(:crowdin_dataset_file_data) do
        {
          'dataset_i18n_key' => 'new_dataset_i18n_val',
        }
      end

      before do
        FileUtils.mkdir_p File.dirname(crowdin_dataset_file_path)
        File.write crowdin_dataset_file_path, JSON.dump(crowdin_dataset_file_data)
      end

      it 'distributes ML Playground dataset localization' do
        expected_i18n_data = {
          **ml_playground_i18n_data,
          'datasets' => {
            dataset_id => crowdin_dataset_file_data
          }
        }

        I18nScriptUtils.expects(:sanitize_data_and_write).with(expected_i18n_data, target_i18n_file_path).once

        distribute_ml_playground_l10n
      end

      context 'when the target i18n file does not exist' do
        before do
          FileUtils.rm(target_i18n_file_path)
        end

        it 'distributes ML Playground dataset localization without ML Playground data' do
          expected_i18n_data = {
            'datasets' => {
              dataset_id => crowdin_dataset_file_data
            }
          }

          I18nScriptUtils.expects(:sanitize_data_and_write).with(expected_i18n_data, target_i18n_file_path).once

          distribute_ml_playground_l10n
        end
      end

      context 'when the Crowdin i18n file is empty' do
        let(:crowdin_dataset_file_data) {{}}

        it 'does not try to distribute ML Playground dataset localization' do
          I18nScriptUtils.expects(:sanitize_data_and_write).with(anything, target_i18n_file_path).never
          distribute_ml_playground_l10n
        end
      end

      context 'when the language is the source language' do
        let(:is_source_language) {true}

        it 'does not distribute ML Playground dataset localization' do
          I18nScriptUtils.expects(:sanitize_data_and_write).with(anything, target_i18n_file_path).never
          distribute_ml_playground_l10n
        end
      end
    end
  end

  describe '#blockly_core_i18n_data' do
    let(:blockly_core_i18n_data) {described_instance.send(:blockly_core_i18n_data, crowdin_file_path)}

    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/blockly-core/core.json')}
    let(:i18n_source_file_data) do
      {
        'a' => 'old',
        'b' => 'old',
      }
    end

    let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'blockly-core/core.json')}
    let(:crowdin_file_data) do
      {
        'a' => '',
        'b' => 'new',
        'c' => '',
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(i18n_source_file_path)
      File.write i18n_source_file_path, JSON.dump(i18n_source_file_data)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    it 'returns Blockly Core i18n data' do
      expected_i18n_data = {
        'a' => 'old',
        'b' => 'new',
        'c' => '',
      }

      I18nScriptUtils.expects(:sort_and_sanitize).with(expected_i18n_data).returns('expected_blockly_core_i18n_data')

      assert_equal 'expected_blockly_core_i18n_data', blockly_core_i18n_data
    end

    context 'when the i18n source file does not exist' do
      before do
        FileUtils.rm(i18n_source_file_path)
      end

      it 'returns Crowdin i18n data' do
        I18nScriptUtils.expects(:sort_and_sanitize).with(crowdin_file_data).returns('expected_blockly_core_i18n_data')

        assert_equal 'expected_blockly_core_i18n_data', blockly_core_i18n_data
      end
    end
  end

  describe '#distribute_blockly_core' do
    let(:distribute_blockly_core_l10n) {described_instance.send(:distribute_blockly_core, language)}

    let(:target_i18n_file_path) {CDO.dir("apps/lib/blockly/#{js_locale}.js")}
    let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'blockly-core/core.json')}
    let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, 'blockly-core/core.json')}
    let(:blockly_core_i18n_data) do
      {
        'blockly_core_i18n_key1' => 'blockly_core_i18n_val1',
        'blockly_core_i18n_key2' => 'blockly_core_i18n_val2',
      }
    end

    before do
      described_instance.stubs(:blockly_core_i18n_data).with(crowdin_file_path).returns(blockly_core_i18n_data)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      FileUtils.touch(crowdin_file_path)
    end

    it 'distributes Blockly Core localization' do
      execution_sequence = sequence('execution')

      expected_blockly_js_i18n_data = <<~JS
        Blockly.Msg.blockly_core_i18n_key1 = "blockly_core_i18n_val1";
        Blockly.Msg.blockly_core_i18n_key2 = "blockly_core_i18n_val2";
      JS

      I18nScriptUtils.expects(:write_file).with(target_i18n_file_path, expected_blockly_js_i18n_data).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale, 'blockly-core')).in_sequence(execution_sequence)

      distribute_blockly_core_l10n
    end

    context 'when the language is the source language' do
      let(:is_source_language) {true}

      it 'does not distribute Blockly Core localization' do
        I18nScriptUtils.expects(:write_file).with(target_i18n_file_path, anything).never
        distribute_blockly_core_l10n
      end
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute Blockly Core localization' do
        I18nScriptUtils.expects(:write_file).with(target_i18n_file_path, anything).never
        distribute_blockly_core_l10n
      end
    end
  end
end
