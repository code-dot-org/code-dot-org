require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/devise_content/sync_out'

describe I18n::Resources::Dashboard::DeviseContent::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::DeviseContent::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'expected_i18n_locale'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

  let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, "dashboard/devise.yml")}
  let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, "dashboard/devise.yml")}
  let(:target_i18n_file_path) {CDO.dir('dashboard/config/locales', "devise.#{i18n_locale}.yml")}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#progress' do
    let(:process_language) {described_instance.process(language)}

    before do
      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      FileUtils.touch(crowdin_file_path)
    end

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(crowdin_file_path, target_i18n_file_path)
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
    end

    context 'when the language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not distribute the localization' do
        expect_localization_distribution.never
        process_language
      end

      it 'moves Crowdin files to the i18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.once
        process_language
      end
    end

    context 'when the Crowdin file does not exists' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute the localization' do
        expect_localization_distribution.never
        process_language
      end

      it 'does not move Crowdin files to the i18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.never
        process_language
      end
    end
  end
end
