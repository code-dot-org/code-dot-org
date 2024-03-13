require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/unplugged_content'

describe I18n::Resources::Dashboard::UnpluggedContent do
  let(:described_class) {I18n::Resources::Dashboard::UnpluggedContent}

  describe '.sync_in' do
    it 'sync-in UnpluggedContent resource' do
      described_class::SyncIn.expects(:perform).once
      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up UnpluggedContent resource' do
      described_class::SyncUp.expects(:perform).once
      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out UnpluggedContent resource' do
      described_class::SyncOut.expects(:perform).once
      described_class.sync_out
    end
  end
end
