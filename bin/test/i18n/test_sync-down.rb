require_relative '../test_helper'
require_relative '../../i18n/sync-down'

describe I18n::SyncDown do
  let(:described_class) {I18n::SyncDown}

  describe '.perform' do
    let(:perform) {described_class.perform}

    before do
      I18n::Metrics.stubs(:report_status).yields(nil)
    end

    it 'sync-down I18n resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Apps.expects(:sync_down).with(testing: false).in_sequence(execution_sequence)
      I18n::Resources::Dashboard.expects(:sync_down).with(testing: false).in_sequence(execution_sequence)
      I18n::Resources::Pegasus.expects(:sync_down).with(testing: false).in_sequence(execution_sequence)
      I18n::Metrics.expects(:report_status).with(true, 'sync-down', 'Sync down completed successfully').in_sequence(execution_sequence)

      perform
    end

    context 'when "--testing" command line option is set' do
      before do
        ARGV << '--testing'
      end

      it 'sync-down I18n resources in testing mode' do
        expected_testing_mode = true

        I18n::Resources::Apps.expects(:sync_down).with(testing: expected_testing_mode).once
        I18n::Resources::Dashboard.expects(:sync_down).with(testing: expected_testing_mode).once
        I18n::Resources::Pegasus.expects(:sync_down).with(testing: expected_testing_mode).once

        perform
      end
    end

    context 'when an error is raised' do
      it 'reports the failure' do
        expected_error = 'test error'

        I18n::Resources::Apps.stubs(:sync_down).raises(expected_error)
        I18n::Resources::Dashboard.stubs(:sync_down).raises(expected_error)
        I18n::Resources::Pegasus.stubs(:sync_down).raises(expected_error)

        I18n::Metrics.expects(:report_status).with(false, 'sync-down', "Sync down failed from the error: #{expected_error}").once

        actual_error = _ {perform}.must_raise expected_error
        _(actual_error.message).must_equal expected_error
      end
    end
  end
end
