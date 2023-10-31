require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/restricted_content'

describe I18n::Resources::Dashboard::RestrictedContent do
  describe '.sync_in' do
    it 'sync-in RestrictedContent resource' do
      I18n::Resources::Dashboard::RestrictedContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::RestrictedContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out RestrictedContent resource' do
      I18n::Resources::Dashboard::RestrictedContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::RestrictedContent.sync_out
    end
  end
end
