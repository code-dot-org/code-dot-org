require 'test_helper'

class Services::ChildAccountTest < ActiveSupport::TestCase
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
      refute_nil user.child_account_compliance_state_last_updated

      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes
      new_state = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      Services::ChildAccount.update_compliance(user, new_state)

      assert_equal new_state, user.child_account_compliance_state
      refute_equal last_updated, user.child_account_compliance_state_last_updated
    end
  end

  class GrantPermissionRequest < ActionDispatch::IntegrationTest
    def assert_enqueued_parent_permission_confirm_mail(permission, &block)
      assert_enqueued_with(
        job: ParentMailer.delivery_job,
        args: ['ParentMailer', 'parent_permission_confirmation', 'deliver_now', {args: [permission.parent_email]}],
        queue: 'mailers',
        at: 24.hours.from_now,
        &block
      )
    end

    teardown do
      Timecop.return
    end

    test 'given nil request it should do nothing' do
      Services::ChildAccount.grant_permission_request! nil
    end

    test 'given permission request it should update user and send email' do
      permission = create :parental_permission_request
      user = permission.user
      assert_enqueued_parent_permission_confirm_mail(permission) do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.child_account_compliance_state
      refute_empty user.child_account_compliance_state_last_updated
    end

    test 'granting permission twice only makes changes once' do
      permission = create :parental_permission_request
      user = permission.user
      assert_enqueued_parent_permission_confirm_mail(permission) do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.child_account_compliance_state
      last_updated = user.child_account_compliance_state_last_updated
      Timecop.travel 5.minutes
      refute_empty last_updated

      # No emails should be sent
      assert_no_enqueued_emails do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      # The date shouldn't be updated
      assert_equal last_updated, user.child_account_compliance_state_last_updated
    end
  end

  describe '.start_grace_period' do
    let(:start_grace_period) {Services::ChildAccount.start_grace_period(user)}

    let(:user) {create(:non_compliant_child)}

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'updates user CAP attributes with "grace period" compliance state' do
      assert_changes -> {user.properties} do
        start_grace_period
      end

      assert_attributes user, {
        child_account_compliance_state: 'p',
        child_account_compliance_state_last_updated: DateTime.now.iso8601(3),
      }
    end
  end

  describe '.lock_out' do
    let(:lock_out) {Services::ChildAccount.lock_out(user)}

    let(:user) {create(:non_compliant_child)}

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'updates user CAP attributes with "lock out" compliance state' do
      assert_changes -> {user.properties} do
        lock_out
      end

      assert_attributes user, {
        child_account_compliance_state: 'l',
        child_account_compliance_lock_out_date: DateTime.now.iso8601(3),
        child_account_compliance_state_last_updated: DateTime.now.iso8601(3),
      }
    end
  end

  describe '.remove_compliance' do
    let(:remove_user_cap_compliance_state) {Services::ChildAccount.remove_compliance(user)}

    let(:user_cap_compliance_updated_at) {1.day.ago}
    let(:user) do
      create(
        :non_compliant_child, :in_grace_period,
        child_account_compliance_state_last_updated: user_cap_compliance_updated_at,
      )
    end

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'removes user CAP compliance state' do
      assert_changes -> {user.reload.child_account_compliance_state}, from: Policies::ChildAccount::ComplianceState::GRACE_PERIOD, to: nil do
        remove_user_cap_compliance_state
      end
    end

    it 'updates user CAP compliance state last updated date' do
      assert_changes -> {user.reload.child_account_compliance_state_last_updated}, from: user_cap_compliance_updated_at.iso8601(3), to: DateTime.now.iso8601(3) do
        remove_user_cap_compliance_state
      end
    end
  end
end
