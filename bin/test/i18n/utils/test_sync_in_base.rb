require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_in_base'

describe I18n::Utils::SyncInBase do
  let(:described_class) {I18n::Utils::SyncInBase}
  let(:described_instance) {described_class.new}

  describe '.perform' do
    before do
      I18n::Metrics.stubs(:report_runtime).yields(nil)
    end

    it 'calls `#perform`' do
      described_class.any_instance.expects(:process).once
      described_class.perform
    end

    it 'calls report_runtime metrics with class name' do
      I18n::Metrics.expects(:report_runtime).with(described_class.name, 'sync-in').once
      described_class.perform
    end

    it 'reports the runtime metric with ResourceParent::ResourceChild' do
      module I18n
        module Resources
          module ResourceParent
            module ResourceChild
              class SyncIn < I18n::Utils::SyncInBase
              end
            end
          end
        end
      end

      I18n::Metrics.expects(:report_runtime).with('ResourceParent::ResourceChild', 'sync-in').once

      I18n::Resources::ResourceParent::ResourceChild::SyncIn.perform
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
