require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/blocks/sync_out'

describe I18n::Resources::Dashboard::Blocks::SyncOut do
  let(:sync_out) {I18n::Resources::Dashboard::Blocks::SyncOut.new}

  let(:malformed_i18n_reporter) {stub}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Dashboard::Blocks::SyncOut.any_instance.expects(:execute).once

      I18n::Resources::Dashboard::Blocks::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}

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
    let(:expect_empty_crowdin_locale_dir_removing) do
      I18nScriptUtils.expects(:remove_empty_dir).with(crowdin_locale_dir)
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
      expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

      sync_out.execute
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not try to process the file' do
        execution_sequence = sequence('execution')

        # Restoration
        expect_crowdin_file_restoration.never
        expect_mailformed_i18n_reporter_file_processing.never
        expect_mailformed_i18n_reporting.never

        # Distribution
        expect_localization_distribution.never

        expect_crowdin_file_to_i18n_locale_dir_moving.never
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
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
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end

    context 'when the locale is en-US' do
      let(:crowdin_locale) {'English'}
      let(:i18n_locale) {'en-US'}

      it 'does not process the file' do
        execution_sequence = sequence('execution')

        # Restoration
        expect_crowdin_file_restoration.never
        expect_mailformed_i18n_reporter_file_processing.never
        expect_mailformed_i18n_reporting.never

        # Distribution
        expect_localization_distribution.never

        expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end
  end
end
