require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/unplugged_content'

describe I18n::Resources::Dashboard::DataContent do
  describe '.sync_in' do
    it 'sync-in UnpluggedContent resource' do
      I18n::Resources::Dashboard::UnpluggedContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::UnpluggedContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out UnpluggedContent resource' do
      I18n::Resources::Dashboard::UnpluggedContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::UnpluggedContent.sync_out
    end
  end
end
