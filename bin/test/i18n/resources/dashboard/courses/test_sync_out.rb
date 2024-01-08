require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/courses/sync_out'

describe I18n::Resources::Dashboard::Courses::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::Courses::SyncOut}
  let(:described_instance) {described_class.new}
  let(:malformed_i18n_reporter) {stub}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'expected_i18n_locale'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

  let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'dashboard/courses.yml')}
  let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, 'dashboard/courses.yml')}
  let(:i18n_backup_file_path) {CDO.dir('i18n/locales/original/dashboard/courses.yml')}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    PegasusLanguages.stubs(:all).returns([language])
    I18n::Utils::MalformedI18nReporter.stubs(:new).with(i18n_locale).returns(malformed_i18n_reporter)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '.perform' do
    let(:perform_sync_out) {described_class.perform}

    let(:expect_localization_restoration) do
      described_class.any_instance.expects(:restore_localization).with(language)
    end
    let(:expect_localization_urls_fixing) do
      described_class.any_instance.expects(:fix_localization_urls).with(language)
    end
    let(:expect_malformed_i18n_reporting) do
      described_class.any_instance.expects(:report_malformed_i18n).with(language)
    end
    let(:expect_localization_distribution) do
      described_class.any_instance.expects(:distribute_localization).with(language)
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end

    before do
      I18n::Metrics.stubs(:report_runtime).yields(nil)
      I18nScriptUtils.stubs(:source_lang?).with(language).returns(false)

      described_class.any_instance.stubs(:restore_localization)
      described_class.any_instance.stubs(:fix_localization_urls)
      described_class.any_instance.stubs(:report_malformed_i18n)
      described_class.any_instance.stubs(:distribute_localization)
      I18nScriptUtils.stubs(:move_file)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      FileUtils.touch(crowdin_file_path)
    end

    it 'restores localization, reports malformed i18n strings and then distributes localization' do
      execution_sequence = sequence('execution')

      expect_localization_restoration.in_sequence(execution_sequence)
      expect_localization_urls_fixing.in_sequence(execution_sequence)
      expect_malformed_i18n_reporting.in_sequence(execution_sequence)
      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      perform_sync_out
    end

    context 'when the language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not restore localization' do
        expect_localization_restoration.never
        perform_sync_out
      end

      it 'does not fix localization urls' do
        expect_localization_urls_fixing.never
        perform_sync_out
      end

      it 'does not report malformed i18n strings' do
        expect_localization_restoration.never
        perform_sync_out
      end

      it 'does not distribute localization' do
        expect_localization_distribution.never
        perform_sync_out
      end

      it 'moves file from the Crowdin locale dir to the I18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.once
        perform_sync_out
      end
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not restore localization' do
        expect_localization_restoration.never
        perform_sync_out
      end

      it 'does not fix localization urls' do
        expect_localization_urls_fixing.never
        perform_sync_out
      end

      it 'does not report malformed i18n strings' do
        expect_localization_restoration.never
        perform_sync_out
      end

      it 'does not distribute localization' do
        expect_localization_distribution.never
        perform_sync_out
      end

      it 'does not move file from the Crowdin locale dir to the I18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.never
        perform_sync_out
      end
    end
  end

  describe '#restore_localization' do
    let(:restore_localization_of_language) {described_instance.send(:restore_localization, language)}

    let(:expect_localization_restoration) do
      RedactRestoreUtils.expects(:restore).with(
        i18n_backup_file_path,
        crowdin_file_path,
        crowdin_file_path,
        %w[resourceLink vocabularyDefinition],
        'md'
      )
    end

    before do
      RedactRestoreUtils.stubs(:restore)

      FileUtils.mkdir_p File.dirname(i18n_backup_file_path)
      FileUtils.touch(i18n_backup_file_path)
    end

    it 'restores localization' do
      expect_localization_restoration.once
      restore_localization_of_language
    end
  end

  describe '#fix_localization_urls' do
    let(:fix_localization_urls) {described_instance.send(:fix_localization_urls, language)}

    let(:crowdin_file_data) do
      {
        'en' => {
          'data' => {
            'resources' => {
              'resource_key' => {
                'url' => ' <https://test.example> '
              }
            }
          }
        }
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, YAML.dump(crowdin_file_data)
    end

    it 'fixes course urls' do
      expected_crowdin_file_content = <<~YAML
        ---
        en:
          data:
            resources:
              resource_key:
                url: https://test.example
      YAML

      fix_localization_urls

      assert_equal expected_crowdin_file_content, File.read(crowdin_file_path)
    end
  end

  describe '#report_malformed_i18n' do
    let(:report_malformed_1i8n) {described_instance.send(:report_malformed_i18n, language)}

    it 'reports malformed i18n strings found in the Crowdin file' do
      execution_sequence = sequence('execution')

      malformed_i18n_reporter.expects(:process_file).with(crowdin_file_path).in_sequence(execution_sequence)
      malformed_i18n_reporter.expects(:report).in_sequence(execution_sequence)

      report_malformed_1i8n
    end
  end

  describe '#distribute_localization' do
    let(:distribute_localization_of_language) {described_instance.send(:distribute_localization, language)}

    it 'distributes localization of the language' do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(
        crowdin_file_path, CDO.dir("dashboard/config/locales/courses.#{i18n_locale}.yml")
      ).once

      distribute_localization_of_language
    end
  end
end
