require 'test_helper'

class Services::ChildAccountTest < ActiveSupport::TestCase
  test 'lock_out given no user should not throw an error' do
    Services::ChildAccount.lock_out(nil)
  end

  test 'lock_out given non compliant user sets the lock_out state' do
    user = create :non_compliant_child

    Services::ChildAccount.lock_out(user)

    assert_equal Policies::ChildAccount::ComplianceState::LOCKED_OUT, user.child_account_compliance_state
    assert_not_nil user.child_account_compliance_state_last_updated
    assert_not_nil user.child_account_compliance_lock_out_date
  end

  test 'lock_out given locked_out user does not update state' do
    user = create :locked_out_child
    compliance_state = user.child_account_compliance_state
    last_updated = user.child_account_compliance_state_last_updated

    Services::ChildAccount.lock_out(user)

    assert_equal compliance_state, user.child_account_compliance_state
    assert_equal last_updated, user.child_account_compliance_state_last_updated
  end

  test 'lock_out given pending_permission user does not update state' do
    user = create :locked_out_child, :with_pending_parent_permission
    compliance_state = user.child_account_compliance_state
    last_updated = user.child_account_compliance_state_last_updated

    Services::ChildAccount.lock_out(user)

    assert_equal compliance_state, user.child_account_compliance_state
    assert_equal last_updated, user.child_account_compliance_state_last_updated
  end

  test 'lock_out given parent_permission user does not update state' do
    user = create :locked_out_child, :with_parent_permission
    compliance_state = user.child_account_compliance_state
    last_updated = user.child_account_compliance_state_last_updated

    Services::ChildAccount.lock_out(user)

    assert_equal compliance_state, user.child_account_compliance_state
    assert_equal last_updated, user.child_account_compliance_state_last_updated
  end

  test 'update_compliance given no user should not throw an error' do
    new_state = Policies::ChildAccount::ComplianceState::LOCKED_OUT

    Services::ChildAccount.update_compliance(nil, new_state)
  end

  test 'update_compliance given user should update the compliance state' do
    # Update the state a few times and make sure the last_update time changes.
    user = create :non_compliant_child

    new_state = Policies::ChildAccount::ComplianceState::LOCKED_OUT
    Services::ChildAccount.update_compliance(user, new_state)

    assert_equal new_state, user.child_account_compliance_state
    assert_not_nil user.child_account_compliance_state_last_updated

    last_updated = user.child_account_compliance_state_last_updated
    new_state = Policies::ChildAccount::ComplianceState::REQUEST_SENT
    Services::ChildAccount.update_compliance(user, new_state)

    assert_equal new_state, user.child_account_compliance_state
    assert_not_equal last_updated, user.child_account_compliance_state_last_updated

    last_updated = user.child_account_compliance_state_last_updated
    new_state = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
    Services::ChildAccount.update_compliance(user, new_state)

    assert_equal new_state, user.child_account_compliance_state
    assert_not_equal last_updated, user.child_account_compliance_state_last_updated
  end
end
