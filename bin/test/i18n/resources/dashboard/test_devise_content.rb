require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/devise_content'

describe I18n::Resources::Dashboard::DeviseContent do
  describe '.sync_in' do
    it 'sync-in DeviseContent resource' do
      I18n::Resources::Dashboard::DeviseContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::DeviseContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out DeviseContent resource' do
      I18n::Resources::Dashboard::DeviseContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::DeviseContent.sync_out
    end
  end
end
