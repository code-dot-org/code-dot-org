require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/data_content'

describe I18n::Resources::Dashboard::DataContent do
  describe '.sync_in' do
    it 'sync-in DataContent resource' do
      I18n::Resources::Dashboard::DataContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::DataContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out DataContent resource' do
      I18n::Resources::Dashboard::DataContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::DataContent.sync_out
    end
  end
end
