require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/slides'

describe I18n::Resources::Dashboard::Slides do
  describe '.sync_in' do
    it 'sync-in Slides resource' do
      I18n::Resources::Dashboard::Slides::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::Slides.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Slides resource' do
      I18n::Resources::Dashboard::Slides::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::Slides.sync_out
    end
  end
end
