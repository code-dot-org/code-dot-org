require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/shared_functions'

describe I18n::Resources::Dashboard::SharedFunctions do
  describe '.sync_in' do
    it 'sync-in SharedFunctions resource' do
      I18n::Resources::Dashboard::SharedFunctions::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::SharedFunctions.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out SharedFunctions resource' do
      I18n::Resources::Dashboard::SharedFunctions::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::SharedFunctions.sync_out
    end
  end
end
