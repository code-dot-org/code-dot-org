require_relative '../test_helper'
require_relative '../../i18n/sync-up'

describe I18n::SyncUp do
  describe '.perform' do
    before do
      I18n::Metrics.stubs(:report_status).yields(nil)
    end

    it 'sync-up I18n resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Apps.expects(:sync_up).with(testing: false).in_sequence(execution_sequence)
      I18n::Resources::Dashboard.expects(:sync_up).with(testing: false).in_sequence(execution_sequence)
      I18n::Resources::Pegasus.expects(:sync_up).with(testing: false).in_sequence(execution_sequence)
      I18n::Metrics.expects(:report_status).with(true, 'sync-up', 'Sync up completed successfully').in_sequence(execution_sequence)

      I18n::SyncUp.perform
    end

    context 'when "--testing" command line option is set' do
      before do
        ARGV << '--testing'
      end

      it 'sync-up I18n resources in testing mode' do
        expected_testing_mode = true

        I18n::Resources::Apps.expects(:sync_up).with(testing: expected_testing_mode).once
        I18n::Resources::Dashboard.expects(:sync_up).with(testing: expected_testing_mode).once
        I18n::Resources::Pegasus.expects(:sync_up).with(testing: expected_testing_mode).once

        I18n::SyncUp.perform
      end
    end

    context 'when an error is raised' do
      it 'reports the failure' do
        expected_error = 'test error'

        I18n::Resources::Apps.stubs(:sync_up).raises(expected_error)
        I18n::Resources::Dashboard.stubs(:sync_up).raises(expected_error)
        I18n::Resources::Pegasus.stubs(:sync_up).raises(expected_error)

        I18n::Metrics.expects(:report_status).with(false, 'sync-up', "Sync up failed from the error: #{expected_error}").once

        actual_error = assert_raises(expected_error) {I18n::SyncUp.perform}
        assert_equal expected_error, actual_error.message
      end
    end
  end
end
