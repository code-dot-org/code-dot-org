require_relative '../test_helper'
require_relative '../../i18n/sync-in'

class I18n::SyncInTest < Minitest::Test
  def test_correct_methods_execution
    exec_seq = sequence('execution')

    I18n::Resources::Apps.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Dashboard.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Pegasus.expects(:sync_in).in_sequence(exec_seq)

    I18n::SyncIn.perform
  end

  def test_exception_handling
    expected_error = 'test error'

    I18n::Resources::Apps.stubs(:sync_in).raises(expected_error)
    I18n::Resources::Dashboard.stubs(:sync_in).raises(expected_error)
    I18n::Resources::Pegasus.stubs(:sync_in).raises(expected_error)

    assert_raises(expected_error) {I18n::SyncIn.perform}
  end
end
