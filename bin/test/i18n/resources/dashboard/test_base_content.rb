require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/base_content'

describe I18n::Resources::Dashboard::BaseContent do
  describe '.sync_in' do
    it 'sync-in BaseContent resource' do
      I18n::Resources::Dashboard::BaseContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::BaseContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out BaseContent resource' do
      I18n::Resources::Dashboard::BaseContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::BaseContent.sync_out
    end
  end
end
