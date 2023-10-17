require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/external_sources/sync_out'

describe I18n::Resources::Apps::ExternalSources::SyncOut do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Apps::ExternalSources::SyncOut.any_instance.expects(:execute).once

      I18n::Resources::Apps::ExternalSources::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:sync_out) {I18n::Resources::Apps::ExternalSources::SyncOut.new}

    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}
    let(:i18n_js_locale) {'not_en'}

    before do
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}])
      I18nScriptUtils.stubs(:to_js_locale).with(i18n_locale).returns(i18n_js_locale)
    end

    it 'deletes empty Crowdin locale dir' do
      I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale)).once

      sync_out.execute
    end

    describe 'ml-playground translations distribution' do
      let(:target_i18n_file_path) {CDO.dir("apps/i18n/mlPlayground/#{i18n_js_locale}.json")}

      context 'when Crowdin locale `external-sources/ml-playground/ml_playground.json` file exists' do
        let(:crowdin_ml_playground_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'external-sources/ml-playground/mlPlayground.json')}
        let(:crowdin_ml_playground_translations) {{'ml_playground' => 'expected_crowdin_translations'}}
        let(:i18n_ml_playground_file_path) {CDO.dir('i18n/locales', i18n_locale, 'external-sources/ml-playground/mlPlayground.json')}

        let(:expected_new_ml_playground_translations) {crowdin_ml_playground_translations}
        let(:expected_new_target_i18n_file_data) {'sorted_and_sanitized_ml_playground_translations'}

        before do
          FileUtils.mkdir_p(File.dirname(crowdin_ml_playground_file_path))
          File.write(crowdin_ml_playground_file_path, JSON.dump(crowdin_ml_playground_translations))

          I18nScriptUtils.stubs(:sort_and_sanitize).with(expected_new_ml_playground_translations).returns(expected_new_target_i18n_file_data)
        end

        it 'distributes the translations' do
          sync_out.execute

          assert File.exist?(target_i18n_file_path)
          assert_equal expected_new_target_i18n_file_data, JSON.load_file(target_i18n_file_path)
        end

        it 'moves the file from Crowdin locale dir to I18n locale dir' do
          assert File.exist?(crowdin_ml_playground_file_path)
          refute File.exist?(i18n_ml_playground_file_path)

          sync_out.execute

          refute File.exist?(crowdin_ml_playground_file_path)
          assert File.exist?(i18n_ml_playground_file_path)
          assert_equal crowdin_ml_playground_translations, JSON.load_file(i18n_ml_playground_file_path)
        end

        context 'when the target i18n file with `datasets` translations is already exist' do
          let(:initial_target_i18n_file_data) do
            {
              'ml_playground' => 'apps_i18n_translation',
              'datasets' => {
                'dataset1' => 'expected_apps_i18n_dataset1_translation',
              }
            }
          end
          let(:expected_new_ml_playground_translations) do
            {
              **crowdin_ml_playground_translations,
              'datasets' => initial_target_i18n_file_data['datasets'],
            }
          end

          before do
            FileUtils.mkdir_p(File.dirname(target_i18n_file_path))
            File.write(target_i18n_file_path, JSON.dump(initial_target_i18n_file_data))
          end

          it 'the updated target i18n file data contains the `datasets` translations' do
            sync_out.execute

            assert File.exist?(target_i18n_file_path)
            assert_equal expected_new_target_i18n_file_data, JSON.load_file(target_i18n_file_path)
          end
        end

        context 'when the files are en-US' do
          let(:crowdin_locale) {'English'}
          let(:i18n_locale) {'en-US'}
          let(:i18n_js_locale) {'en_us'}

          it 'does not distribute the translations' do
            sync_out.execute

            refute File.exist?(target_i18n_file_path)
          end

          it 'moves the file from Crowdin locale dir to I18n locale dir' do
            assert File.exist?(crowdin_ml_playground_file_path)
            refute File.exist?(i18n_ml_playground_file_path)

            sync_out.execute

            refute File.exist?(crowdin_ml_playground_file_path)
            assert File.exist?(i18n_ml_playground_file_path)
            assert_equal crowdin_ml_playground_translations, JSON.load_file(i18n_ml_playground_file_path)
          end
        end
      end

      context 'when Crowdin locale ml_playground dataset file exists' do
        let(:dataset_id) {'expected_dataset_id'}
        let(:crowdin_ml_playground_dataset_file_path) {CDO.dir('i18n/locales', crowdin_locale, "external-sources/ml-playground/datasets/#{dataset_id}.json")}
        let(:crowdin_ml_playground_dataset_translations) {{'ml_playground_dataset' => 'expected_translation'}}
        let(:i18n_ml_playground_dataset_file_path) {CDO.dir('i18n/locales', i18n_locale, "external-sources/ml-playground/datasets/#{dataset_id}.json")}

        let(:expected_new_ml_playground_datasets_translations) do
          {
            'datasets' => {
              dataset_id => crowdin_ml_playground_dataset_translations
            }
          }
        end
        let(:expected_new_target_i18n_file_data) {'sorted_and_sanitized_ml_playground_dataset_translations'}

        before do
          FileUtils.mkdir_p(File.dirname(crowdin_ml_playground_dataset_file_path))
          File.write(crowdin_ml_playground_dataset_file_path, JSON.dump(crowdin_ml_playground_dataset_translations))

          I18nScriptUtils.stubs(:sort_and_sanitize).with(expected_new_ml_playground_datasets_translations).returns(expected_new_target_i18n_file_data)
        end

        it 'distributes the translations' do
          sync_out.execute

          assert File.exist?(target_i18n_file_path)
          assert_equal expected_new_target_i18n_file_data, JSON.load_file(target_i18n_file_path)
        end

        it 'moves the file from Crowdin locale dir to I18n locale dir' do
          assert File.exist?(crowdin_ml_playground_dataset_file_path)
          refute File.exist?(i18n_ml_playground_dataset_file_path)

          sync_out.execute

          refute File.exist?(crowdin_ml_playground_dataset_file_path)
          assert File.exist?(i18n_ml_playground_dataset_file_path)
          assert_equal crowdin_ml_playground_dataset_translations, JSON.load_file(i18n_ml_playground_dataset_file_path)
        end

        context 'when the target i18n file with `datasets` translations is already exist' do
          let(:initial_target_i18n_file_data) do
            {
              'ml_playground' => 'expected_apps_i18n_translation',
              'datasets' => {
                dataset_id => 'apps_i18n_dataset_translation',
              }
            }
          end
          let(:expected_new_ml_playground_datasets_translations) do
            {
              'ml_playground' => initial_target_i18n_file_data['ml_playground'],
              'datasets' => {
                dataset_id => crowdin_ml_playground_dataset_translations
              },
            }
          end

          before do
            FileUtils.mkdir_p(File.dirname(target_i18n_file_path))
            File.write(target_i18n_file_path, JSON.dump(initial_target_i18n_file_data))
          end

          it 'replaces the existing target i18n file `datasets` translations with the new ones' do
            sync_out.execute

            assert File.exist?(target_i18n_file_path)
            assert_equal expected_new_target_i18n_file_data, JSON.load_file(target_i18n_file_path)
          end
        end

        context 'when the files are en-US' do
          let(:crowdin_locale) {'English'}
          let(:i18n_locale) {'en-US'}
          let(:i18n_js_locale) {'en_us'}

          it 'does not distribute the translations' do
            sync_out.execute

            refute File.exist?(target_i18n_file_path)
          end

          it 'moves the file from Crowdin locale dir to I18n locale dir' do
            assert File.exist?(crowdin_ml_playground_dataset_file_path)
            refute File.exist?(i18n_ml_playground_dataset_file_path)

            sync_out.execute

            refute File.exist?(crowdin_ml_playground_dataset_file_path)
            assert File.exist?(i18n_ml_playground_dataset_file_path)
            assert_equal crowdin_ml_playground_dataset_translations, JSON.load_file(i18n_ml_playground_dataset_file_path)
          end
        end
      end
    end

    describe 'Blockly Core translations distribution' do
      let(:target_i18n_file_path) {CDO.dir("apps/lib/blockly/#{i18n_js_locale}.js")}

      let(:crowdin_blockly_core_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'blockly-core/core.json')}
      let(:crowdin_blockly_core_file_data) {{'BLOCKLY_CORE' => 'Crowdin "translation"'}}
      let(:i18n_blockly_core_file_path) {CDO.dir('i18n/locales', i18n_locale, 'blockly-core/core.json')}

      let(:expected_new_blockly_core_translations) {crowdin_blockly_core_file_data}
      let(:expected_new_target_i18n_file_data) {expected_new_blockly_core_translations}

      before do
        FileUtils.mkdir_p(File.dirname(crowdin_blockly_core_file_path))
        File.write(crowdin_blockly_core_file_path, JSON.dump(crowdin_blockly_core_file_data))

        I18nScriptUtils.stubs(:sort_and_sanitize).with(expected_new_blockly_core_translations).returns(expected_new_target_i18n_file_data)
      end

      it 'distributes the translations' do
        sync_out.execute

        assert File.exist?(target_i18n_file_path)
        assert_equal %Q[Blockly.Msg.BLOCKLY_CORE = "Crowdin \\"translation\\"";\n], File.read(target_i18n_file_path)
      end

      it 'moves the file from Crowdin locale dir to I18n locale dir' do
        assert File.exist?(crowdin_blockly_core_file_path)
        refute File.exist?(i18n_blockly_core_file_path)

        sync_out.execute

        refute File.exist?(crowdin_blockly_core_file_path)
        assert File.exist?(i18n_blockly_core_file_path)
        assert_equal crowdin_blockly_core_file_data, JSON.load_file(i18n_blockly_core_file_path)
      end

      context 'when the I18n source `blockly-core/core.json` files exists' do
        let(:i18n_source_blockly_core_file_path) {CDO.dir('i18n/locales/source/blockly-core/core.json')}
        let(:i18n_source_blockly_core_file_data) do
          {
            'BLOCKLY_CORE' => 'Source "translation"',
            'BLOCKLY_CORE_2' => 'Source 2 "translation"',
          }
        end

        let(:expected_new_blockly_core_translations) do
          {
            'BLOCKLY_CORE' => 'Crowdin "translation"',
            'BLOCKLY_CORE_2' => i18n_source_blockly_core_file_data['BLOCKLY_CORE_2'],
          }
        end

        before do
          FileUtils.mkdir_p(File.dirname(i18n_source_blockly_core_file_path))
          File.write(i18n_source_blockly_core_file_path, JSON.dump(i18n_source_blockly_core_file_data))
        end

        it 'distributes the Crowdin file with merged I18n source file content' do
          expected_target_i18n_file_content = <<-JS.gsub(/^ {12}/, '')
            Blockly.Msg.BLOCKLY_CORE = "Crowdin \\"translation\\"";
            Blockly.Msg.BLOCKLY_CORE_2 = "Source 2 \\"translation\\"";
          JS

          sync_out.execute
          assert_equal expected_target_i18n_file_content, File.read(target_i18n_file_path)
        end
      end

      context 'when the files are en-US' do
        let(:crowdin_locale) {'English'}
        let(:i18n_locale) {'en-US'}
        let(:i18n_js_locale) {'en_us'}

        it 'does not distribute the translations' do
          sync_out.execute

          refute File.exist?(target_i18n_file_path)
        end

        it 'moves the file from Crowdin locale dir to I18n locale dir' do
          assert File.exist?(crowdin_blockly_core_file_path)
          refute File.exist?(i18n_blockly_core_file_path)

          sync_out.execute

          refute File.exist?(crowdin_blockly_core_file_path)
          assert File.exist?(i18n_blockly_core_file_path)
          assert_equal crowdin_blockly_core_file_data, JSON.load_file(i18n_blockly_core_file_path)
        end
      end
    end
  end
end
