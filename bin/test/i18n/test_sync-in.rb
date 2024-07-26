require_relative '../test_helper'
require_relative '../../i18n/sync-in'

describe I18n::SyncIn do
  describe '.perform' do
    it 'sync-in I18n resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Apps.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Dashboard.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Pegasus.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Metrics.expects(:report_status).with(true, 'sync-in', 'Sync in completed successfully').in_sequence(execution_sequence)

      I18n::SyncIn.perform
    end

    context 'when an error is raised' do
      it 'reports the failure' do
        expected_error = 'test error'

        I18n::Resources::Apps.stubs(:sync_in).raises(expected_error)
        I18n::Resources::Dashboard.stubs(:sync_in).raises(expected_error)
        I18n::Resources::Pegasus.stubs(:sync_in).raises(expected_error)

        I18n::Metrics.expects(:report_status).with(false, 'sync-in', "Sync in failed from the error: #{expected_error}").once

        actual_error = assert_raises(expected_error) {I18n::SyncIn.perform}
        assert_equal expected_error, actual_error.message
      end
    end
  end
end
