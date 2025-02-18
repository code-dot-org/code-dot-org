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

      assert_equal new_state, user.cap_status
      refute_nil user.cap_status_date

      last_updated = user.cap_status_date
      Timecop.travel 5.minutes
      new_state = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      Services::ChildAccount.update_compliance(user, new_state)

      assert_equal new_state, user.cap_status
      refute_equal last_updated, user.cap_status_date
    end
  end

  class GrantPermissionRequest < ActionDispatch::IntegrationTest
    let(:grant_permission_request!) {Services::ChildAccount.grant_permission_request!(parental_permission_request)}

    let(:user) {create(:non_compliant_child)}
    let(:parental_permission_request) {create(:parental_permission_request, user: user)}

    let(:expect_permission_granting_cap_event_logging) do
      Services::ChildAccount::EventLogger.expects(:log_permission_granting).with(user)
    end

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
      permission = parental_permission_request
      expect_permission_granting_cap_event_logging.once
      assert_enqueued_parent_permission_confirm_mail(permission) do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.cap_status
      refute_nil user.cap_status_date
    end

    test 'granting permission twice only makes changes once' do
      permission = parental_permission_request
      expect_permission_granting_cap_event_logging.once
      assert_enqueued_parent_permission_confirm_mail(permission) do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.cap_status
      last_updated = user.cap_status_date
      Timecop.travel 5.minutes
      refute_nil last_updated

      # No emails should be sent
      assert_no_enqueued_emails do
        Services::ChildAccount.grant_permission_request! permission
      end
      user.reload
      # The date shouldn't be updated
      assert_equal last_updated, user.cap_status_date
    end

    context 'when something goes wrong during user saving' do
      let(:error) {'expected_error'}

      before do
        user.stubs(:save!).raises(error)
      end

      it 'does not log "permission_granting" CAP user event' do
        expect_permission_granting_cap_event_logging.never
        assert_raises(error) {grant_permission_request!}
      end
    end
  end

  describe '.start_grace_period' do
    let(:start_grace_period) {Services::ChildAccount.start_grace_period(user)}

    let(:user) {create(:non_compliant_child)}

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'updates user CAP attributes with "grace period" compliance state' do
      start_grace_period

      assert_attributes user, {
        cap_status: 'p',
        cap_status_date: Time.now.change(usec: 0),
      }
    end

    it 'logs "grace_period_start" CAP user event' do
      assert_difference 'CAP::UserEvent.count' do
        start_grace_period
      end

      cap_user_event = CAP::UserEvent.find_by(user: user)

      refute_nil cap_user_event
      assert_attributes cap_user_event, {
        name: 'grace_period_start',
        policy: 'cpa',
        state_before: nil,
        state_after: 'p',
      }
    end

    context 'when something goes wrong during user saving' do
      let(:error) {'expected_error'}

      before do
        user.stubs(:save!).raises(error)
      end

      it 'does not log "grace_period_start" CAP user event' do
        assert_no_difference 'CAP::UserEvent.count' do
          assert_raises(error) {start_grace_period}
        end
      end
    end
  end

  describe '.lock_out' do
    let(:lock_out) {Services::ChildAccount.lock_out(user)}

    let(:user) {create(:non_compliant_child)}

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'updates user CAP attributes with "lock out" compliance state' do
      lock_out

      assert_attributes user.reload, {
        cap_status: 'l',
        cap_status_date: Time.now.change(usec: 0),
      }
    end

    it 'logs "account_locking" CAP user event' do
      assert_difference 'CAP::UserEvent.count' do
        lock_out
      end

      cap_user_event = CAP::UserEvent.find_by(user: user)

      refute_nil cap_user_event
      assert_attributes cap_user_event, {
        name: 'account_locking',
        policy: 'cpa',
        state_before: nil,
        state_after: 'l',
      }
    end

    context 'when something goes wrong during user saving' do
      let(:error) {'expected_error'}

      before do
        user.stubs(:save!).raises(error)
      end

      it 'does not log "account_locking" CAP user event' do
        assert_no_difference 'CAP::UserEvent.count' do
          assert_raises(error) {lock_out}
        end
      end
    end
  end

  describe '.remove_compliance' do
    let(:remove_user_cap_compliance_state) {Services::ChildAccount.remove_compliance(user)}

    let(:user_cap_compliance_updated_at) {1.day.ago.change(usec: 0)}
    let(:user) do
      create(
        :non_compliant_child, :in_grace_period,
        cap_status_date: user_cap_compliance_updated_at,
      )
    end

    around do |test|
      Timecop.freeze {test.call}
    end

    it 'removes user CAP compliance state' do
      assert_changes -> {user.reload.cap_status}, from: Policies::ChildAccount::ComplianceState::GRACE_PERIOD, to: nil do
        remove_user_cap_compliance_state
      end
    end

    it 'updates user CAP compliance state last updated date' do
      assert_changes -> {user.reload.cap_status_date}, from: user_cap_compliance_updated_at, to: Time.now.change(usec: 0) do
        remove_user_cap_compliance_state
      end
    end

    it 'logs "compliance_removing" CAP user event' do
      assert_difference 'CAP::UserEvent.count' do
        remove_user_cap_compliance_state
      end

      cap_user_event = CAP::UserEvent.find_by(user: user)

      refute_nil cap_user_event
      assert_attributes cap_user_event, {
        name: 'compliance_removing',
        policy: 'cpa',
        state_before: 'p',
        state_after: nil,
      }
    end

    context 'when something goes wrong during user saving' do
      let(:error) {'expected_error'}

      before do
        user.stubs(:save!).raises(error)
      end

      it 'does not log "compliance_removing" CAP user event' do
        assert_no_difference 'CAP::UserEvent.count' do
          assert_raises(error) {remove_user_cap_compliance_state}
        end
      end
    end
  end
end
