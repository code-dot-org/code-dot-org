require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/text_to_speech/sync_out'

describe I18n::Resources::Apps::TextToSpeech::SyncOut do
  let(:described_class) {I18n::Resources::Apps::TextToSpeech::SyncOut}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    TextToSpeech.stubs(:tts_upload_to_s3)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe 'TTS_LOCALES' do
    it 'returns TextToSpeech VOICES keys' do
      _(described_class::TTS_LOCALES).must_equal %i[en-US es-ES es-MX it-IT pt-BR]
    end
  end

  describe '#perform' do
    let(:perform_sync_out) {described_instance.perform}

    let(:locale) {'uk-UA'}
    let(:js_locale) {'uk_ua'}

    let(:lab) {'expected_lab'}
    let(:lab_message_key) {'expected_lab_message_key'}
    let(:lab_message_i10n) {'expected_lab_message_i10n'}

    let(:lab_i18n_file_path) {CDO.dir("apps/i18n/#{lab}/#{js_locale}.json")}
    let(:lab_i18n_file_data) {{lab_message_key => lab_message_i10n}}

    let(:labs_feedback_message_keys) {{lab => [lab_message_key]}}

    around do |test|
      described_class.stub_const(:TTS_LOCALES, [locale]) do
        described_class.stub_const(:LABS_FEEDBACK_MESSAGE_KEYS, labs_feedback_message_keys) {test.call}
      end
    end

    before do
      FileUtils.mkdir_p File.dirname(lab_i18n_file_path)
      File.write lab_i18n_file_path, JSON.dump(lab_i18n_file_data)
    end

    it 'updates TTS I18n Static Messages' do
      expected_tts_message_l10n = 'expected_tts_message_l10n'
      expected_tts_file_path = 'expected_tts_file_path'

      TextToSpeech.expects(:sanitize).with(lab_message_i10n).once.returns(expected_tts_message_l10n)
      TextToSpeech.expects(:tts_path).with(lab_message_i10n, lab_message_i10n, locale: locale).once.returns(expected_tts_file_path)
      TextToSpeech.expects(:tts_upload_to_s3).with(expected_tts_message_l10n, 'message', expected_tts_file_path, 'update_i18n_static_messages', locale: locale).once

      perform_sync_out
    end

    context 'when the lab i18n file does not exist' do
      before do
        FileUtils.rm(lab_i18n_file_path)
      end

      it 'does not update TTS I18n Static Messages' do
        TextToSpeech.expects(:tts_upload_to_s3).never
        perform_sync_out
      end
    end

    context 'when the lab i18n data is empty' do
      let(:lab_i18n_file_data) {{}}

      it 'does not update TTS I18n Static Messages' do
        TextToSpeech.expects(:tts_upload_to_s3).never
        perform_sync_out
      end
    end

    context 'when the lab localized message does not exist' do
      let(:lab_message_i10n) {nil}

      it 'does not update TTS I18n Static Messages' do
        TextToSpeech.expects(:tts_upload_to_s3).never
        perform_sync_out
      end
    end
  end
end
