require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_in_base'

describe I18n::Utils::SyncInBase do
  describe '.process' do
    TestSyncInProcess = Class.new(I18n::Utils::SyncInBase)

    it 'preserves `@process_block`' do
      assert_raises(NotImplementedError) {TestSyncInProcess.send(:process_block).call}

      TestSyncInProcess.send(:process) {'expected_process'}

      assert_equal 'expected_process', TestSyncInProcess.send(:process_block).call
    end
  end

  describe '.perform' do
    TestSyncInPerform = Class.new(I18n::Utils::SyncInBase)

    let(:perform_sync_out) {TestSyncInPerform.perform}

    it 'executes `@process_block`' do
      expected_process = proc {'expected_process'}

      TestSyncInPerform.instance_variable_set(:@process_block, expected_process)
      TestSyncInPerform.any_instance.expects(:instance_exec).with(&expected_process).once

      perform_sync_out
    end
  end
end
