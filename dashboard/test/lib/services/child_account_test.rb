require 'test_helper'

class Services::ChildAccountTest < ActiveSupport::TestCase
  class LockOut < ActiveSupport::TestCase
    teardown do
      Timecop.return
    end

    test 'given no user should not throw an error' do
      Services::ChildAccount.lock_out(nil)
    end

    test 'given non compliant user sets the lock_out state' do
      user = create :non_compliant_child

      Services::ChildAccount.lock_out(user)

      assert_equal Policies::ChildAccount::ComplianceState::LOCKED_OUT, user.child_account_compliance_state
      assert_not_nil user.child_account_compliance_state_last_updated
      assert_not_nil user.child_account_compliance_lock_out_date
    end

    test 'given locked_out user does not update state' do
      user = create :locked_out_child
      compliance_state = user.child_account_compliance_state
      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes

      Services::ChildAccount.lock_out(user)

      assert_equal compliance_state, user.child_account_compliance_state
      assert_equal last_updated, user.child_account_compliance_state_last_updated
    end

    test 'given pending_permission user does not update state' do
      user = create :locked_out_child, :with_pending_parent_permission
      compliance_state = user.child_account_compliance_state
      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes

      Services::ChildAccount.lock_out(user)

      assert_equal compliance_state, user.child_account_compliance_state
      assert_equal last_updated, user.child_account_compliance_state_last_updated
    end

    test 'given parent_permission user does not update state' do
      user = create :locked_out_child, :with_parent_permission
      compliance_state = user.child_account_compliance_state
      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes

      Services::ChildAccount.lock_out(user)

      assert_equal compliance_state, user.child_account_compliance_state
      assert_equal last_updated, user.child_account_compliance_state_last_updated
    end
  end

  class UpdateCompliance < ActiveSupport::TestCase
    teardown do
      Timecop.return
    end

    test 'given no user should not throw an error' do
      new_state = Policies::ChildAccount::ComplianceState::LOCKED_OUT

      Services::ChildAccount.update_compliance(nil, new_state)
    end

    test 'given user should update the compliance state' do
      # Update the state a few times and make sure the last_update time changes.
      user = create :non_compliant_child

      new_state = Policies::ChildAccount::ComplianceState::LOCKED_OUT
      Services::ChildAccount.update_compliance(user, new_state)

      assert_equal new_state, user.child_account_compliance_state
      assert_not_nil user.child_account_compliance_state_last_updated

      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes
      new_state = Policies::ChildAccount::ComplianceState::REQUEST_SENT
      Services::ChildAccount.update_compliance(user, new_state)

      assert_equal new_state, user.child_account_compliance_state
      assert_not_equal last_updated, user.child_account_compliance_state_last_updated

      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes
      new_state = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      Services::ChildAccount.update_compliance(user, new_state)

      assert_equal new_state, user.child_account_compliance_state
      assert_not_equal last_updated, user.child_account_compliance_state_last_updated
    end
  end

  class GrantPermissionRequest < ActionDispatch::IntegrationTest
    teardown do
      Timecop.return
    end

    test 'given nil request it should do nothing' do
      Services::ChildAccount.grant_permission_request! nil
    end

    test 'given permission request it should update user and send email' do
      permission = create :parental_permission_request
      user = permission.user
      assert_emails 1 do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.child_account_compliance_state
      assert_not_empty user.child_account_compliance_state_last_updated
    end

    test 'granting permission twice only makes changes once' do
      permission = create :parental_permission_request
      user = permission.user
      assert_emails 1 do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.child_account_compliance_state
      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes
      assert_not_empty last_updated

      # No emails should be sent
      assert_emails 0 do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      # The date shouldn't be updated
      assert_equal last_updated, user.child_account_compliance_state_last_updated
    end
  end
end
