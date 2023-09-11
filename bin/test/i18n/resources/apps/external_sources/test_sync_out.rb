require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/external_sources/sync_out'

describe I18n::Resources::Apps::ExternalSources::SyncOut do
  let(:sync_out) {I18n::Resources::Apps::Labs::SyncIn.new}

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

    let(:crowdin_locale) {'crowdin_locale'}
    let(:i18n_locale) {'i18n-LOCALE'}
    let(:i18n_js_locale) {'js_locale'}

    let(:crowdin_locale_ml_playground_file_path) {CDO.dir(File.join('i18n/locales', crowdin_locale, 'external-sources/ml-playground/mlPlayground.json'))}
    let(:ml_playground_file_content) {{'ml_playground' => 'expected_translation'}}
    let(:i18n_locale_ml_playground_file_path) {CDO.dir(File.join('i18n/locales', i18n_locale, 'external-sources/ml-playground/mlPlayground.json'))}

    let(:crowdin_locale_ml_playground_dataset_file_path) {CDO.dir(File.join('i18n/locales', crowdin_locale, 'external-sources/ml-playground/datasets/expected_dataset.json'))}
    let(:ml_playground_dataset_file_content) {{'ml_playground_dataset' => 'expected_translation'}}
    let(:i18n_locale_ml_playground_dataset_file_path) {CDO.dir(File.join('i18n/locales', i18n_locale, 'external-sources/ml-playground/datasets/expected_dataset.json'))}

    let(:crowdin_locale_blockly_core_file_path) {CDO.dir(File.join('i18n/locales', crowdin_locale, 'blockly-core/core.json'))}
    let(:blockly_core_file_content) {{'BLOCKLY_CORE' => 'Crowdin "translation"'}}
    let(:i18n_locale_blockly_core_file_path) {CDO.dir(File.join('i18n/locales', i18n_locale, 'blockly-core/core.json'))}

    let(:apps_i18n_ml_playground_file_path) {CDO.dir(File.join("apps/i18n/mlPlayground/#{i18n_js_locale}.json"))}
    let(:apps_lib_blockly_i18n_js_file_path) {CDO.dir(File.join("apps/lib/blockly/#{i18n_js_locale}.js"))}

    before do
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}])
      I18nScriptUtils.stubs(:to_js_locale).with(i18n_locale).returns(i18n_js_locale)
    end

    context 'when the file is not en-US' do
      let(:crowdin_locale) {'Not English'}
      let(:i18n_locale) {'not-EN'}

      it 'deletes empty Crowdin locale dir' do
        I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale)).once

        sync_out.execute
      end

      context 'if Crowdin locale `external-sources/ml-playground/ml_playground.json` file exists' do
        before do
          FileUtils.mkdir_p(File.dirname(crowdin_locale_ml_playground_file_path))
          File.write(crowdin_locale_ml_playground_file_path, JSON.dump(ml_playground_file_content))
        end

        it 'distributes the file' do
          expected_apps_i18n_ml_playground_file_content = 'expected_apps_i18n_ml_playground_file_content'

          I18nScriptUtils.expects(:sort_and_sanitize).with(ml_playground_file_content).once.returns(
            expected_apps_i18n_ml_playground_file_content
          )

          sync_out.execute

          assert File.exist?(apps_i18n_ml_playground_file_path)
          assert_equal JSON.dump(expected_apps_i18n_ml_playground_file_content), File.read(apps_i18n_ml_playground_file_path)
        end

        it 'moves the file from Crowdin locale dir to I18n locale dir' do
          assert File.exist?(crowdin_locale_ml_playground_file_path)
          refute File.exist?(i18n_locale_ml_playground_file_path)

          sync_out.execute

          refute File.exist?(crowdin_locale_ml_playground_file_path)
          assert File.exist?(i18n_locale_ml_playground_file_path)
        end

        context 'and Crowdin locale ml_playground dataset file exists' do
          before do
            # Should be replaced with the crowdin_locale_ml_playground_file_path
            FileUtils.mkdir_p(File.dirname(i18n_locale_ml_playground_file_path))
            FileUtils.touch(i18n_locale_ml_playground_file_path)

            FileUtils.mkdir_p(File.dirname(crowdin_locale_ml_playground_dataset_file_path))
            File.write(crowdin_locale_ml_playground_dataset_file_path, JSON.dump(ml_playground_dataset_file_content))
          end

          it 'distributes Crowdin files' do
            exec_seq = sequence('execution')
            expected_apps_i18n_ml_playground_file_content = 'expected_apps_i18n_ml_playground_file_content'

            I18nScriptUtils.expects(:sort_and_sanitize).with(ml_playground_file_content).in_sequence(exec_seq).returns(ml_playground_file_content)
            I18nScriptUtils.expects(:sort_and_sanitize).with(
              ml_playground_file_content.merge('datasets' => {'expected_dataset' => ml_playground_dataset_file_content})
            ).in_sequence(exec_seq).returns(
              expected_apps_i18n_ml_playground_file_content
            )

            sync_out.execute

            assert File.exist?(apps_i18n_ml_playground_file_path)
            assert_equal JSON.dump(expected_apps_i18n_ml_playground_file_content), File.read(apps_i18n_ml_playground_file_path)
          end

          it 'replaces I18n locale dir files with Crowdin locale dir files' do
            assert File.exist?(crowdin_locale_ml_playground_file_path)
            assert File.exist?(crowdin_locale_ml_playground_dataset_file_path)

            assert File.exist?(i18n_locale_ml_playground_file_path)
            refute File.exist?(i18n_locale_ml_playground_dataset_file_path)

            sync_out.execute

            refute File.exist?(crowdin_locale_ml_playground_file_path)
            refute File.exist?(crowdin_locale_ml_playground_dataset_file_path)

            assert File.exist?(i18n_locale_ml_playground_file_path)
            assert File.exist?(i18n_locale_ml_playground_dataset_file_path)
          end
        end
      end

      context 'if Crowdin locale ml_playground dataset file exists' do
        before do
          FileUtils.mkdir_p(File.dirname(crowdin_locale_ml_playground_dataset_file_path))
          File.write(crowdin_locale_ml_playground_dataset_file_path, JSON.dump(ml_playground_dataset_file_content))
        end

        it 'distributes the file' do
          expected_apps_i18n_ml_playground_file_content = 'expected_apps_i18n_ml_playground_file_content'

          I18nScriptUtils.expects(:sort_and_sanitize).with(
            {'datasets' => {'expected_dataset' => ml_playground_dataset_file_content}}
          ).once.returns(
            expected_apps_i18n_ml_playground_file_content
          )

          sync_out.execute

          assert File.exist?(apps_i18n_ml_playground_file_path)
          assert_equal JSON.dump(expected_apps_i18n_ml_playground_file_content), File.read(apps_i18n_ml_playground_file_path)
        end

        it 'moves the file from Crowdin locale dir to I18n locale dir' do
          assert File.exist?(crowdin_locale_ml_playground_dataset_file_path)
          refute File.exist?(i18n_locale_ml_playground_dataset_file_path)

          sync_out.execute

          refute File.exist?(crowdin_locale_ml_playground_dataset_file_path)
          assert File.exist?(i18n_locale_ml_playground_dataset_file_path)
        end
      end

      context 'if Crowdin locale blockly-core/core.json file exists' do
        before do
          FileUtils.mkdir_p(File.dirname(crowdin_locale_blockly_core_file_path))
          File.write(crowdin_locale_blockly_core_file_path, JSON.dump(blockly_core_file_content))
        end

        it 'distributes the file' do
          I18nScriptUtils.expects(:sort_and_sanitize).with(blockly_core_file_content).once.returns(blockly_core_file_content)

          sync_out.execute

          assert File.exist?(apps_lib_blockly_i18n_js_file_path)
          assert_equal %Q[Blockly.Msg.BLOCKLY_CORE = "Crowdin \\"translation\\"";\n], File.read(apps_lib_blockly_i18n_js_file_path)
        end

        it 'moves the file from Crowdin locale dir to I18n locale dir' do
          assert File.exist?(crowdin_locale_blockly_core_file_path)
          refute File.exist?(i18n_locale_blockly_core_file_path)

          sync_out.execute

          refute File.exist?(crowdin_locale_blockly_core_file_path)
          assert File.exist?(i18n_locale_blockly_core_file_path)
        end

        context 'and I18n source blockly-core/core.json files exists' do
          let(:i18n_source_blockly_core_file_path) {CDO.dir(File.join('i18n/locales/source/blockly-core/core.json'))}
          let(:en_blockly_core_file_content) do
            {
              'BLOCKLY_CORE' => 'Source "translation"',
              'BLOCKLY_CORE_2' => 'Source 2 "translation"',
            }
          end

          before do
            # Should be replaced with the crowdin_locale_blockly_core_file_path
            FileUtils.mkdir_p(File.dirname(i18n_locale_blockly_core_file_path))
            FileUtils.touch(i18n_locale_blockly_core_file_path)

            FileUtils.mkdir_p(File.dirname(i18n_source_blockly_core_file_path))
            File.write(i18n_source_blockly_core_file_path, JSON.dump(en_blockly_core_file_content))
          end

          it 'distributes the Crowdin file with merged I18n source file content' do
            expected_apps_lib_blockly_i18n_js_file_content = <<-JS.gsub(/^ {14}/, '')
              Blockly.Msg.BLOCKLY_CORE = "Crowdin \\"translation\\"";
              Blockly.Msg.BLOCKLY_CORE_2 = "Source 2 \\"translation\\"";
            JS

            sync_out.execute

            assert File.exist?(apps_lib_blockly_i18n_js_file_path)
            assert_equal expected_apps_lib_blockly_i18n_js_file_content, File.read(apps_lib_blockly_i18n_js_file_path)
          end

          it 'replaces I18n locale dir files with Crowdin locale dir files' do
            assert File.exist?(crowdin_locale_blockly_core_file_path)
            assert File.exist?(i18n_locale_blockly_core_file_path)

            sync_out.execute

            refute File.exist?(crowdin_locale_blockly_core_file_path)
            assert File.exist?(i18n_locale_blockly_core_file_path)
          end
        end
      end
    end

    context 'when the files are en-US' do
      let(:crowdin_locale) {'English'}
      let(:i18n_locale) {'en-US'}

      before do
        FileUtils.mkdir_p(File.dirname(crowdin_locale_ml_playground_file_path))
        File.write(crowdin_locale_ml_playground_file_path, JSON.dump(ml_playground_file_content))

        FileUtils.mkdir_p(File.dirname(crowdin_locale_ml_playground_dataset_file_path))
        File.write(crowdin_locale_ml_playground_dataset_file_path, JSON.dump(ml_playground_dataset_file_content))

        FileUtils.mkdir_p(File.dirname(crowdin_locale_blockly_core_file_path))
        File.write(crowdin_locale_blockly_core_file_path, JSON.dump(blockly_core_file_content))
      end

      it 'does not distribute the files' do
        sync_out.execute

        refute File.exist?(apps_i18n_ml_playground_file_path)
        refute File.exist?(apps_lib_blockly_i18n_js_file_path)
      end

      it 'moves the files from Crowdin locale dir to I18n locale dir' do
        assert File.exist?(crowdin_locale_ml_playground_file_path)
        assert File.exist?(crowdin_locale_ml_playground_dataset_file_path)
        assert File.exist?(crowdin_locale_blockly_core_file_path)

        refute File.exist?(i18n_locale_ml_playground_file_path)
        refute File.exist?(i18n_locale_ml_playground_dataset_file_path)
        refute File.exist?(i18n_locale_blockly_core_file_path)

        sync_out.execute

        refute File.exist?(crowdin_locale_ml_playground_file_path)
        refute File.exist?(crowdin_locale_ml_playground_dataset_file_path)
        refute File.exist?(crowdin_locale_blockly_core_file_path)

        assert File.exist?(i18n_locale_ml_playground_file_path)
        assert File.exist?(i18n_locale_ml_playground_dataset_file_path)
        assert File.exist?(i18n_locale_blockly_core_file_path)
      end

      it 'deletes empty Crowdin locale dir' do
        I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale)).once

        sync_out.execute
      end
    end
  end
end
