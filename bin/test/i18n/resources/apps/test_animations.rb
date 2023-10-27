require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/animations'

describe I18n::Resources::Apps::Animations do
  describe '.sync_in' do
    it 'sync-in Animations resource' do
      I18n::Resources::Apps::Animations::SyncIn.expects(:perform).once
      I18n::Resources::Apps::Animations.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Animations resource' do
      I18n::Resources::Apps::Animations::SyncOut.expects(:perform).once
      I18n::Resources::Apps::Animations.sync_out
    end
  end
end
