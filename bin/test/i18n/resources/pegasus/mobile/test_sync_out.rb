require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/mobile/sync_out'

describe I18n::Resources::Pegasus::Mobile::SyncOut do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Pegasus::Mobile::SyncOut.any_instance.expects(:execute).once

      I18n::Resources::Pegasus::Mobile::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:sync_out) {I18n::Resources::Pegasus::Mobile::SyncOut.new}

    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_resource_dir) {File.join(crowdin_locale_dir, 'pegasus')}
    let(:crowdin_file_path) {File.join(crowdin_resource_dir, 'mobile.yml')}
    let(:pegasus_i18n_file_path) {CDO.dir('pegasus/cache/i18n', "#{i18n_locale}.yml")}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(crowdin_file_path, pegasus_i18n_file_path)
    end
    let(:expect_crowdin_resource_dir_to_i18n_resource_dir_renaming) do
      I18nScriptUtils.expects(:rename_dir).with(crowdin_resource_dir, CDO.dir('i18n/locales', i18n_locale, 'pegasus'))
    end
    let(:expect_empty_crowdin_locale_dir_removing) do
      I18nScriptUtils.expects(:remove_empty_dir).with(crowdin_locale_dir)
    end

    before do
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}])

      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_resource_dir_to_i18n_resource_dir_renaming.in_sequence(execution_sequence)
      expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

      sync_out.execute
    end

    context 'when the locale is en-US' do
      let(:crowdin_locale) {'English'}
      let(:i18n_locale) {'en-US'}

      it 'does not distribute the localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_crowdin_resource_dir_to_i18n_resource_dir_renaming.in_sequence(execution_sequence)
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute the localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_crowdin_resource_dir_to_i18n_resource_dir_renaming.never
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end
  end
end
