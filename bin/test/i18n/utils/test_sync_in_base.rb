require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_in_base'

describe I18n::Utils::SyncInBase do
  let(:described_class) {I18n::Utils::SyncInBase}
  let(:described_instance) {described_class.new}

  describe '.perform' do
    it 'calls `#perform`' do
      described_class.any_instance.expects(:process).once
      described_class.perform
    end

    it 'calls report_runtime metrics with class name' do
      I18n::Metrics.expects(:report_runtime).with(described_class.name, 'sync-in').once
      described_class.perform
    end
  end

  describe '#process' do
    it 'raises NotImplementedError' do
      assert_raises(NotImplementedError) {described_instance.send(:process)}
    end
  end

  describe '#perform' do
    it 'calls `#process`' do
      described_instance.expects(:process).once
      described_instance.send(:perform)
    end
  end
end
