require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/labs/sync_out'

describe I18n::Resources::Apps::Labs::SyncOut do
  let(:sync_out) {I18n::Resources::Apps::Labs::SyncOut.new}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
    I18nScriptUtils.stubs(:upload_malformed_restorations)
    RedactRestoreUtils.stubs(:restore)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Apps::Labs::SyncOut.any_instance.expects(:execute).once

      I18n::Resources::Apps::Labs::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:crowdin_locale) {'English'}
    let(:i18n_locale) {'en-US'}
    let(:i18n_js_locale) {'en_us'}

    let(:i18n_original_file_path) {CDO.dir("i18n/locales/original/blockly-mooc/#{lab}.json")}
    let(:crowdin_locale_file_path) {CDO.dir('i18n/locales', crowdin_locale, "blockly-mooc/#{lab}.json")}
    let(:i18n_locale_file_path) {CDO.dir('i18n/locales', i18n_locale, "blockly-mooc/#{lab}.json")}
    let(:apps_i18n_lab_file_path) {CDO.dir('apps/i18n', lab, "#{i18n_js_locale}.json")}
    let(:en_apps_i18n_lab_file_path) {CDO.dir('apps/i18n', lab, 'en_us.json')}

    let(:malformed_i18n_reporter) {stub}

    let(:expect_crowdin_file_restoration) do
      RedactRestoreUtils.expects(:restore).with(
        i18n_original_file_path,
        crowdin_locale_file_path,
        crowdin_locale_file_path,
        %w[link]
      )
    end
    let(:expect_crowdin_locale_file_processing_by_malformed_i18n_reporter) do
      malformed_i18n_reporter.expects(:process_file).with(crowdin_locale_file_path)
    end
    let(:expect_invalid_i18n_reporting) do
      malformed_i18n_reporter.expects(:report)
    end
    let(:expect_crowdin_locale_file_distribution) do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(crowdin_locale_file_path, apps_i18n_lab_file_path)
    end
    let(:expect_crowdin_locale_dir_renaming) do
      I18nScriptUtils.expects(:rename_dir).with(File.dirname(crowdin_locale_file_path), File.dirname(i18n_locale_file_path))
    end
    let(:expect_empty_crowdin_locale_dir_deletion) do
      I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale))
    end

    before do
      I18n::Utils::MalformedI18nReporter.stubs(:new).with(i18n_locale).returns(malformed_i18n_reporter)
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}])
      I18nScriptUtils.stubs(:to_js_locale).with(i18n_locale).returns(i18n_js_locale)

      FileUtils.mkdir_p(File.dirname(i18n_original_file_path))
      File.write(i18n_original_file_path, JSON.dump({'i18n_original' => 'expected_translations'}))

      FileUtils.mkdir_p(File.dirname(crowdin_locale_file_path))
      File.write(crowdin_locale_file_path, JSON.dump({'crowdin_locale' => 'expected_translations'}))

      FileUtils.mkdir_p(File.dirname(en_apps_i18n_lab_file_path))
      File.write(en_apps_i18n_lab_file_path, JSON.dump({'en_apps_i18n_lab' => 'expected_translations'}))
    end

    context 'when the file is not en-US' do
      let(:crowdin_locale) {'Not English'}
      let(:i18n_locale) {'not-EN'}
      let(:i18n_js_locale) {'not_en'}

      context "and the lab is was not redacted" do
        let(:lab) {'unredactable'}

        it 'distributes the Crowdin locale file' do
          execution_sequence = sequence('execution')

          expect_crowdin_file_restoration.never
          expect_crowdin_locale_file_processing_by_malformed_i18n_reporter.never
          expect_invalid_i18n_reporting.once

          expect_crowdin_locale_file_distribution.in_sequence(execution_sequence)
          expect_crowdin_locale_dir_renaming.in_sequence(execution_sequence)
          expect_empty_crowdin_locale_dir_deletion.in_sequence(execution_sequence)

          sync_out.execute
        end
      end

      I18n::Resources::Apps::Labs::REDACTABLE_LABS.each do |redactable_lab|
        context "and the lab is `#{redactable_lab}` (redacted)" do
          let(:lab) {redactable_lab}

          it 'restores and distributes the Crowdin locale file' do
            execution_sequence = sequence('execution')

            expect_crowdin_file_restoration.in_sequence(execution_sequence)
            expect_crowdin_locale_file_processing_by_malformed_i18n_reporter.in_sequence(execution_sequence)
            expect_invalid_i18n_reporting.in_sequence(execution_sequence)
            expect_crowdin_locale_file_distribution.in_sequence(execution_sequence)
            expect_crowdin_locale_dir_renaming.in_sequence(execution_sequence)
            expect_empty_crowdin_locale_dir_deletion.in_sequence(execution_sequence)

            sync_out.execute
          end
        end
      end

      I18n::Resources::Apps::Labs::UNTRANSLATABLE_LABS.each do |untranslatable_lab|
        context "and the lab is `#{untranslatable_lab}`" do
          let(:lab) {untranslatable_lab}

          it 'replaces `apps/i18n` locale files with English one' do
            execution_sequence = sequence('execution')

            expect_crowdin_file_restoration.never
            expect_crowdin_locale_file_processing_by_malformed_i18n_reporter.never
            expect_invalid_i18n_reporting.once
            expect_crowdin_locale_file_distribution.never

            expect_crowdin_locale_dir_renaming.in_sequence(execution_sequence)
            expect_empty_crowdin_locale_dir_deletion.in_sequence(execution_sequence)

            sync_out.execute

            assert File.exist?(apps_i18n_lab_file_path)
            assert_equal '{"en_apps_i18n_lab":"expected_translations"}', File.read(apps_i18n_lab_file_path)
          end
        end
      end
    end

    context 'when the file is en-US' do
      let(:crowdin_locale) {'English'}
      let(:i18n_locale) {'en-US'}
      let(:i18n_js_locale) {'en_us'}

      I18n::Resources::Apps::Labs::REDACTABLE_LABS.each do |redactable_lab|
        context "and the lab is `#{redactable_lab}` (redacted)" do
          let(:lab) {redactable_lab}

          it 'does not restore and does not distribute the Crowdin locale file' do
            execution_sequence = sequence('execution')

            expect_crowdin_file_restoration.never
            expect_crowdin_locale_file_processing_by_malformed_i18n_reporter.never
            expect_invalid_i18n_reporting.never
            expect_crowdin_locale_file_distribution.never
            expect_crowdin_locale_dir_renaming.in_sequence(execution_sequence)
            expect_empty_crowdin_locale_dir_deletion.in_sequence(execution_sequence)

            sync_out.execute
          end
        end
      end
    end
  end
end
