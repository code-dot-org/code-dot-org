require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/docs'

describe I18n::Resources::Dashboard::Docs do
  describe '.sync_in' do
    it 'sync-in programming Docs' do
      I18n::Resources::Dashboard::Docs::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::Docs.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Courses resource' do
      I18n::Resources::Dashboard::Docs::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::Docs.sync_out
    end
  end
end
