require_relative '../test_helper'
require_relative '../../i18n/sync-out'

describe I18n::SyncOut do
  before do
    I18n::Metrics.stubs(:report_status)
  end

  describe '.perform' do
    it 'sync-out I18n resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Apps.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Dashboard.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Pegasus.expects(:sync_out).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:crowdin_projects).returns('expected_crowdin_projects')
      I18n::SyncOut.expects(:clean_up_sync_out).with('expected_crowdin_projects').in_sequence(execution_sequence)
      I18n::Metrics.expects(:report_status).with(true, 'sync-out', 'Sync out completed successfully').in_sequence(execution_sequence)

      I18n::SyncOut.perform
    end

    context 'when an error is raised' do
      it 'reports the failure' do
        expected_error = 'expected_error'

        I18n::Resources::Apps.stubs(:sync_out).raises(expected_error)
        I18n::Resources::Dashboard.stubs(:sync_out).raises(expected_error)
        I18n::Resources::Pegasus.stubs(:sync_out).raises(expected_error)
        I18n::SyncOut.stubs(:clean_up_sync_out).raises(expected_error)

        I18n::Metrics.expects(:report_status).with(false, 'sync-out', "Sync out failed from the error: #{expected_error}")

        actual_error = assert_raises(expected_error) {I18n::SyncOut.perform}
        assert_equal expected_error, actual_error.message
      end
    end
  end
end
