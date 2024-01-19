require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/base_content'

describe I18n::Resources::Dashboard::BaseContent do
  let(:described_class) {I18n::Resources::Dashboard::BaseContent}

  describe '.sync_in' do
    it 'sync-in BaseContent resource' do
      described_class::SyncIn.expects(:perform).once
      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up BaseContent resource' do
      described_class::SyncUp.expects(:perform).once
      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out BaseContent resource' do
      described_class::SyncOut.expects(:perform).once
      described_class.sync_out
    end
  end
end
