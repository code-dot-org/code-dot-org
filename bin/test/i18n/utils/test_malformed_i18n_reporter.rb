require_relative '../../test_helper'
require_relative '../../../i18n/utils/malformed_i18n_reporter'

describe I18n::Utils::MalformedI18nReporter do
  let(:malformed_i18n_reporter) {I18n::Utils::MalformedI18nReporter.new(locale)}

  let(:locale) {'en-US'}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    Google::Drive.any_instance.stubs(:update_spreadsheet)
  end

  describe '#process_file' do
    let(:i18n_file_path) {'/i18n_file.json'}
    let(:i18n_file_data) do
      {
        valid_translation: 'valid translation',
        malformed_redaction: 'translation with `[malformed_redaction] [0]` syntax',
        invalid_i18n_hash: {
          malformed_markdown: 'translation with `[malformed_markdown] (test.example)` link',
        },
      }
    end
    let(:i18n_file_content) {JSON.dump(i18n_file_data)}

    before do
      File.write(i18n_file_path, i18n_file_content)
    end

    it 'collects invalid translations for the sheet from the file' do
      assert_empty malformed_i18n_reporter.worksheet_data

      malformed_i18n_reporter.process_file(i18n_file_path)

      expected_worksheet_data = [
        ['en-US.malformed_redaction', i18n_file_path, i18n_file_data[:malformed_redaction]],
        ['en-US.invalid_i18n_hash.malformed_markdown', i18n_file_path, i18n_file_data.dig(:invalid_i18n_hash, :malformed_markdown)]
      ]

      assert_equal expected_worksheet_data, malformed_i18n_reporter.worksheet_data
    end

    context 'when the file does not exist' do
      before do
        FileUtils.rm(i18n_file_path)
      end

      it 'does nothing' do
        malformed_i18n_reporter.process_file(i18n_file_path)
        assert_empty malformed_i18n_reporter.worksheet_data
      end
    end

    context 'when the file data is invalid' do
      let(:i18n_file_content) {'invalid_json_data'}

      it 'does nothing' do
        malformed_i18n_reporter.process_file(i18n_file_path)
        assert_empty malformed_i18n_reporter.worksheet_data
      end
    end
  end

  describe '#report' do
    let(:worksheet_data) {[%w[expected_key expected_file_name expected_translation]]}
    let(:gdrive_export_secret) {'expected_gdrive_export_secret'}
    let(:google_drive) {stub}

    before do
      malformed_i18n_reporter.instance_variable_set(:@worksheet_data, worksheet_data)
      CDO.stubs(:gdrive_export_secret).returns(gdrive_export_secret)
      Google::Drive.stubs(:new).with(service_account_key: gdrive_export_secret).returns(google_drive)
    end

    it 'updates Google spreadsheet "i18n_bad_translations" with invalid translations sheet data' do
      google_drive.expects(:update_worksheet).with(
        'i18n_bad_translations', locale, [['Key', 'File Name', 'Translation'], *worksheet_data]
      ).once

      malformed_i18n_reporter.report

      assert_equal [], malformed_i18n_reporter.worksheet_data
    end

    context 'when CDO.gdrive_export_secret is not present' do
      let(:gdrive_export_secret) {nil}

      it 'does not try to update Google spreadsheet' do
        Google::Drive.any_instance.expects(:update_worksheet).never

        malformed_i18n_reporter.report

        assert_empty malformed_i18n_reporter.worksheet_data
      end
    end

    context 'when there are no invalid translations' do
      let(:worksheet_data) {[]}

      it 'does not update Google spreadsheet' do
        google_drive.expects(:update_worksheet).never

        malformed_i18n_reporter.report

        assert_empty malformed_i18n_reporter.worksheet_data
      end
    end
  end
end
