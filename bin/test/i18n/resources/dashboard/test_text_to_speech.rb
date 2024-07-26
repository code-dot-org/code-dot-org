require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/text_to_speech'

describe I18n::Resources::Dashboard::TextToSpeech do
  describe '.sync_out' do
    it 'sync-out TextToSpeech resource' do
      I18n::Resources::Dashboard::TextToSpeech::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::TextToSpeech.sync_out
    end
  end
end
