require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/mobile'

describe I18n::Resources::Pegasus::Mobile do
  let(:described_class) {I18n::Resources::Pegasus::Mobile}

  describe '.sync_in' do
    it 'sync-in Mobile resource' do
      described_class::SyncIn.expects(:perform).once
      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up Mobile resource' do
      described_class::SyncUp.expects(:perform).once
      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out Mobile resource' do
      described_class::SyncOut.expects(:perform).once
      described_class.sync_out
    end
  end
end
