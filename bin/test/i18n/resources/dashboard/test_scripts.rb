require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/scripts'

describe I18n::Resources::Dashboard::Scripts do
  describe '.sync_in' do
    it 'sync-in Scripts resource' do
      I18n::Resources::Dashboard::Scripts::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::Scripts.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Scripts resource' do
      I18n::Resources::Dashboard::Scripts::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::Scripts.sync_out
    end
  end
end
