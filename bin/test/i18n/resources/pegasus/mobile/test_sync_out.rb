require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/mobile/sync_out'

describe I18n::Resources::Pegasus::Mobile::SyncOut do
  let(:described_class) {I18n::Resources::Pegasus::Mobile::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'Test'}
  let(:i18n_locale) {'te-ST'}
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

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_resource_dir) {File.join(crowdin_locale_dir, 'pegasus')}
    let(:crowdin_file_path) {File.join(crowdin_resource_dir, 'mobile.yml')}
    let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, 'pegasus/mobile.yml')}
    let(:pegasus_i18n_file_path) {CDO.dir('pegasus/cache/i18n', "#{i18n_locale}.yml")}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(crowdin_file_path, pegasus_i18n_file_path)
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end

    before do
      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
    end

    context 'when the language is the source language' do
      let(:is_source_language) {true}

      it 'does not distribute the localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

        process_language
      end
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute the localization' do
        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.never

        process_language
      end
    end
  end
end
