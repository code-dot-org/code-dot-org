require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/marketing_announcements/sync_out'

describe I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut}
  let(:described_instance) {described_class.new}

  let(:lang_crowdin_name) {'expected_crowdin_name'}
  let(:lang_locale) {'expected_locale'}
  let(:language) {{crowdin_name_s: lang_crowdin_name, locale_s: lang_locale}}

  let(:target_i18n_file_path) {CDO.dir('dashboard/config/locales', "marketing_announcements.#{lang_locale}.json")}
  let(:i18n_file_path) {CDO.dir('i18n/locales', lang_locale, "dashboard/marketing_announcements.json")}
  let(:crowdin_file_path) {CDO.dir('i18n/locales', lang_crowdin_name, "dashboard/marketing_announcements.json")}
  let(:crowdin_file_data) do
    {
      'banners' => {
        'expected_banner_id' => {
          'title' => 'expected_banner_title',
          'body' => 'expected_banner_body',
          'buttonText' => 'expected_banner_buttonText',
        }
      }
    }
  end

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    before do
      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    let(:expect_distribute_translations) do
      I18nScriptUtils.
        expects(:sanitize_data_and_write).
        with({lang_locale => {'data' => {'marketing_announcements' => crowdin_file_data}}}, target_i18n_file_path)
    end
    let(:expect_moving_crowdin_file_to_i18n_locale_dir) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_distribute_translations.in_sequence(execution_sequence)
      expect_moving_crowdin_file_to_i18n_locale_dir.in_sequence(execution_sequence)

      process_language
    end

    context 'when the language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not distribute the localization' do
        expect_distribute_translations.never
        process_language
      end

      it 'moves Crowdin files to the i18n locale dir' do
        expect_moving_crowdin_file_to_i18n_locale_dir.once
        process_language
      end
    end

    context 'when the Crowdin file does not exists' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute the localization' do
        expect_distribute_translations.never
        process_language
      end

      it 'does not move Crowdin files to the i18n locale dir' do
        expect_moving_crowdin_file_to_i18n_locale_dir.never
        process_language
      end
    end
  end
end
