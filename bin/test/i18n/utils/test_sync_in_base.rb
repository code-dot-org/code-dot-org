require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_in_base'

describe I18n::Utils::SyncInBase do
  describe '.process' do
    it 'defines the instance method `#process`' do
      expected_process = 'defined_process'

      I18n::Utils::SyncInBase.process {expected_process}

      assert_equal expected_process, I18n::Utils::SyncInBase.new.process
    end
  end

  describe '.perform' do
    let(:perform_sync_out) {I18n::Utils::SyncInBase.perform}

    it 'executes the sync-out process' do
      I18n::Utils::SyncInBase.any_instance.expects(:process).once
      perform_sync_out
    end
  end

  describe '#process' do
    it 'raises NotImplementedError' do
      assert_raises(NotImplementedError) {I18n::Utils::SyncInBase.new.send(:process)}
    end
  end
end
