require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_out'

describe I18n::Resources::Apps::Animations::SyncOut do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    let(:crowdin_locale) {'crowdin_locale'}
    let(:i18n_locale) {'i18n-LOCALE'}

    let(:spritelab_file_content) {'expected_spritelab_file_content'}
    let(:crowdin_spritelab_file_path) {CDO.dir(File.join('i18n/locales', crowdin_locale, 'animations/spritelab_animation_library.json'))}
    let(:i18n_spritelab_file_path) {CDO.dir(File.join('i18n/locales', i18n_locale, 'animations/spritelab_animation_library.json'))}

    let(:spritelab_manifest_builder) do
      manifest_builder_stub = stub
      ManifestBuilder.stubs(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).returns(manifest_builder_stub)
      manifest_builder_stub
    end

    context 'when Crowdin locale file exists' do
      before do
        FileUtils.mkdir_p(File.dirname(crowdin_spritelab_file_path))
        File.write(crowdin_spritelab_file_path, JSON.dump(spritelab_file_content))
      end

      context 'if the file is not en-US' do
        let(:crowdin_locale) {'Not English'}
        let(:i18n_locale) {'not-EN'}

        it 'sync-out the file' do
          PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}]) do
            spritelab_manifest_builder.expects(:initial_animation_metadata).once
            I18nScriptUtils.expects(:delete_empty_crowdin_locale_dir).with(crowdin_locale).once
            I18nScriptUtils.expects(:to_js_locale).with(i18n_locale).once.returns('expected_js_locale')
            spritelab_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', spritelab_file_content).once

            assert File.exist?(crowdin_spritelab_file_path)
            refute File.exist?(i18n_spritelab_file_path)

            I18n::Resources::Apps::Animations::SyncOut.perform

            refute File.exist?(crowdin_spritelab_file_path)
            assert File.exist?(i18n_spritelab_file_path)
          end
        end
      end

      context 'if the file is en-US' do
        let(:crowdin_locale) {'English'}
        let(:i18n_locale) {'en-US'}

        it 'does not sync-out the file' do
          PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}]) do
            spritelab_manifest_builder.expects(:initial_animation_metadata).once
            I18nScriptUtils.expects(:delete_empty_crowdin_locale_dir).with(crowdin_locale).once
            I18nScriptUtils.expects(:to_js_locale).with(i18n_locale).never.returns('expected_js_locale')
            spritelab_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', spritelab_file_content).never

            assert File.exist?(crowdin_spritelab_file_path)
            refute File.exist?(i18n_spritelab_file_path)

            I18n::Resources::Apps::Animations::SyncOut.perform

            refute File.exist?(crowdin_spritelab_file_path)
            assert File.exist?(i18n_spritelab_file_path)
          end
        end
      end
    end

    context 'when Crowdin locale file does not exist' do
      it 'skips the locale sync-out' do
        PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}]) do
          spritelab_manifest_builder.expects(:initial_animation_metadata).once
          I18nScriptUtils.expects(:delete_empty_crowdin_locale_dir).with(crowdin_locale).never
          I18nScriptUtils.expects(:to_js_locale).with(i18n_locale).never.returns('expected_js_locale')
          spritelab_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', spritelab_file_content).never

          refute File.exist?(crowdin_spritelab_file_path)
          refute File.exist?(i18n_spritelab_file_path)

          I18n::Resources::Apps::Animations::SyncOut.perform

          refute File.exist?(crowdin_spritelab_file_path)
          refute File.exist?(i18n_spritelab_file_path)
        end
      end
    end
  end
end
