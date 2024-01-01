require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/external_sources'

describe I18n::Resources::Apps::ExternalSources do
  let(:described_class) {I18n::Resources::Apps::ExternalSources}

  describe '.sync_in' do
    it 'sync-in External Sources resource' do
      described_class::SyncIn.expects(:perform).once
      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up External Sources resource' do
      described_class::SyncUp.expects(:perform).once
      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out External Sources resource' do
      described_class::SyncOut.expects(:perform).once
      described_class.sync_out
    end
  end
end
