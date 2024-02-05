require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/blocks/sync_out'

describe I18n::Resources::Dashboard::Blocks::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::Blocks::SyncOut}
  let(:described_instance) {described_class.new}

  let(:malformed_i18n_reporter) {stub}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'expected_i18n_locale'}
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
    let(:crowdin_file_path) {File.join(crowdin_locale_dir, 'dashboard/blocks.yml')}
    let(:i18n_backup_file_path) {CDO.dir('i18n/locales/original/dashboard/blocks.yml')}

    let(:expect_crowdin_file_restoration) do
      RedactRestoreUtils.expects(:restore).with(
        i18n_backup_file_path, crowdin_file_path, crowdin_file_path, %w[blockfield], 'txt'
      )
    end
    let(:expect_mailformed_i18n_reporter_file_processing) do
      malformed_i18n_reporter.expects(:process_file).with(crowdin_file_path)
    end
    let(:expect_mailformed_i18n_reporting) do
      malformed_i18n_reporter.expects(:report)
    end
    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(
        crowdin_file_path, CDO.dir('dashboard/config/locales', "blocks.#{i18n_locale}.yml")
      )
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(
        crowdin_file_path, CDO.dir('i18n/locales', i18n_locale, 'dashboard/blocks.yml')
      )
    end

    before do
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}])
      I18n::Utils::MalformedI18nReporter.stubs(:new).with(i18n_locale).returns(malformed_i18n_reporter)

      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)

      FileUtils.mkdir_p(File.dirname(i18n_backup_file_path))
      FileUtils.touch(i18n_backup_file_path)
    end

    it 'restores the file and then distributes the localization' do
      execution_sequence = sequence('execution')

      # Restoration
      expect_crowdin_file_restoration.in_sequence(execution_sequence)
      expect_mailformed_i18n_reporter_file_processing.in_sequence(execution_sequence)
      expect_mailformed_i18n_reporting.in_sequence(execution_sequence)

      # Distribution
      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not try to process the file' do
        # Restoration
        expect_crowdin_file_restoration.never
        expect_mailformed_i18n_reporter_file_processing.never
        expect_mailformed_i18n_reporting.never

        # Distribution
        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.never

        process_language
      end
    end

    context 'when the i18n backup file does not exist' do
      before do
        FileUtils.rm(i18n_backup_file_path)
      end

      it 'distributes the file' do
        execution_sequence = sequence('execution')

        # Restoration
        expect_crowdin_file_restoration.never
        expect_mailformed_i18n_reporter_file_processing.never
        expect_mailformed_i18n_reporting.never

        # Distribution
        expect_localization_distribution.in_sequence(execution_sequence)
        expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

        process_language
      end
    end

    context 'when the language is the source language' do
      let(:is_source_language) {true}

      it 'does not process the file' do
        execution_sequence = sequence('execution')

        # Restoration
        expect_crowdin_file_restoration.never
        expect_mailformed_i18n_reporter_file_processing.never
        expect_mailformed_i18n_reporting.never

        # Distribution
        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

        process_language
      end
    end
  end
end
