require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/external_sources'

describe I18n::Resources::Apps::ExternalSources do
  describe '.sync_in' do
    it 'sync-in ExternalSources resource' do
      I18n::Resources::Apps::ExternalSources::SyncIn.expects(:perform).once

      I18n::Resources::Apps::ExternalSources.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out ExternalSources resource' do
      I18n::Resources::Apps::ExternalSources::SyncOut.expects(:perform).once

      I18n::Resources::Apps::ExternalSources.sync_out
    end
  end
end
