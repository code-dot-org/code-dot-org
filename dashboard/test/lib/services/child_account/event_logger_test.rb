require 'test_helper'

class Services::ChildAccount::EventLoggerTest < ActiveSupport::TestCase
  setup do
    @user = create(:locked_out_child)
  end

  test 'call - creates CAP user event' do
    event_name = CAP::UserEvent::ACCOUNT_LOCKING

    # Simulate updating the state to 'granted'
    @user.cap_status = 'g'
    @user.save

    # Should record the prior and current state
    assert_creates 'CAP::UserEvent' do
      assert_attributes Services::ChildAccount::EventLogger.call(user: @user, event_name: event_name), {
        id: :not_nil,
        user: @user,
        name: event_name,
        policy: 'cpa',
        created_at: :not_nil,
        state_before: 'l',
        state_after: 'g',
      }
    end
  end

  test 'call - does not create CAP user event when no policy found' do
    @user.update(us_state: nil)

    assert_does_not_create 'CAP::UserEvent' do
      assert_nil Services::ChildAccount::EventLogger.call(user: @user, event_name: CAP::UserEvent::ACCOUNT_LOCKING)
    end
  end

  test 'log_parent_email_submit' do
    event_name = CAP::UserEvent::PARENT_EMAIL_SUBMIT
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_parent_email_submit(@user)
  end

  test 'log_parent_email_update' do
    event_name = CAP::UserEvent::PARENT_EMAIL_UPDATE
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_parent_email_update(@user)
  end

  test 'log_permission_granting' do
    event_name = CAP::UserEvent::PERMISSION_GRANTING
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_permission_granting(@user)
  end

  test 'log_grace_period_start' do
    event_name = CAP::UserEvent::GRACE_PERIOD_START
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_grace_period_start(@user)
  end

  test 'log_account_locking' do
    event_name = CAP::UserEvent::ACCOUNT_LOCKING
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_account_locking(@user)
  end

  test 'log_account_purging' do
    event_name = CAP::UserEvent::ACCOUNT_PURGING
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_account_purging(@user)
  end

  test 'log_compliance_removing' do
    event_name = CAP::UserEvent::COMPLIANCE_REMOVING
    Services::ChildAccount::EventLogger.expects(:call).with(user: @user, event_name: event_name).returns(event_name)
    assert_equal event_name, Services::ChildAccount::EventLogger.log_compliance_removing(@user)
  end
end
