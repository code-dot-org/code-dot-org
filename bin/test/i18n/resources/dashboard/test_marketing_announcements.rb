require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/marketing_announcements'

describe I18n::Resources::Dashboard::MarketingAnnouncements do
  describe '.sync_in' do
    it 'sync-in dashboard marketing announcements resource' do
      I18n::Resources::Dashboard::MarketingAnnouncements::SyncIn.expects(:perform).once

      I18n::Resources::Dashboard::MarketingAnnouncements.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out dashboard marketing announcements resource' do
      I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut.expects(:perform).once

      I18n::Resources::Dashboard::MarketingAnnouncements.sync_out
    end
  end
end
