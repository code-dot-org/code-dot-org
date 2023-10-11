require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/standards'

describe I18n::Resources::Dashboard::Standards do
  describe '.sync_in' do
    it 'sync-in Standards resource' do
      I18n::Resources::Dashboard::Standards::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::Standards.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Standards resource' do
      I18n::Resources::Dashboard::Standards::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::Standards.sync_out
    end
  end
end
