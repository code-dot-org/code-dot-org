require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/blocks'

describe I18n::Resources::Dashboard::Blocks do
  describe '.sync_in' do
    it 'sync-in Blocks resource' do
      I18n::Resources::Dashboard::Blocks::SyncIn.expects(:perform).once

      I18n::Resources::Dashboard::Blocks.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Blocks resource' do
      I18n::Resources::Dashboard::Blocks::SyncOut.expects(:perform).once

      I18n::Resources::Dashboard::Blocks.sync_out
    end
  end
end
