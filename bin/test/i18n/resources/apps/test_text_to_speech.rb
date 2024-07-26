require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/text_to_speech'

describe I18n::Resources::Apps::TextToSpeech do
  describe '.sync_out' do
    it 'sync-out TextToSpeech (TTS) resource' do
      I18n::Resources::Apps::Labs::SyncOut.expects(:perform).once
      I18n::Resources::Apps::Labs.sync_out
    end
  end
end
