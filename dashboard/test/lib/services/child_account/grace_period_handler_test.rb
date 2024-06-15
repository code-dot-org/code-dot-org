require 'test_helper'

class Services::ChildAccount::GracePeriodHandlerTest < ActiveSupport::TestCase
  let(:described_class) {Services::ChildAccount::GracePeriodHandler}
  let(:described_instance) {described_class.new(user: user)}

  let(:user) {build_stubbed(:student)}

  it 'inherits from Services::Base' do
    _(described_class.superclass).must_equal Services::Base
  end

  describe '#call' do
    let(:handle_user_grace_period_transition) {described_instance.call}

    let(:user_eligible_for_grace_period?) {true}
    let(:user_lockout_date) {14.days.from_now}

    let(:expect_grace_period_starting) {Services::ChildAccount.expects(:start_grace_period).with(user)}
    let(:expect_lockout_date_estimating) {Policies::ChildAccount.expects(:lockout_date).with(user).returns(user_lockout_date)}
    let(:expect_lockout_scheduling) do
      cap_lockout_job = mock
      CAP::LockoutJob.stubs(:set).with(wait_until: user_lockout_date).returns(cap_lockout_job)
      cap_lockout_job.expects(:perform_later).with(user_id: user.id)
    end

    before do
      described_instance.stubs(:eligible?).returns(user_eligible_for_grace_period?)

      Services::ChildAccount.stubs(:start_grace_period).with(user)
      Services::ChildAccount.stubs(:lockout_date).with(user).returns(user_lockout_date)
      CAP::LockoutJob.stubs(:set).returns(stub(perform_later: nil))
    end

    it 'starts grace period then schedules lockout job and returns true' do
      execution_sequence = sequence('execution')

      expect_grace_period_starting.in_sequence(execution_sequence)
      expect_lockout_date_estimating.in_sequence(execution_sequence)
      expect_lockout_scheduling.in_sequence(execution_sequence)

      _(handle_user_grace_period_transition).must_equal true
    end

    context 'when user is not eligible for grace period' do
      let(:user_eligible_for_grace_period?) {false}

      it 'does not start grace period' do
        expect_grace_period_starting.never
        handle_user_grace_period_transition
      end

      it 'does not estimate user lockout date' do
        expect_lockout_date_estimating.never
        handle_user_grace_period_transition
      end

      it 'does not schedule lockout job' do
        expect_lockout_scheduling.never
        handle_user_grace_period_transition
      end

      it 'returns false' do
        _(handle_user_grace_period_transition).must_equal false
      end
    end

    context 'when user has no lockout date after start of grace period' do
      let(:user_lockout_date) {nil}

      it 'raises LockoutSchedulingError' do
        _ {handle_user_grace_period_transition}.must_raise described_class::LockoutSchedulingError
      end
    end
  end

  describe '#eligible?' do
    let(:eligible?) {described_instance.send(:eligible?)}

    let(:user_is_cap_compliant?) {false}
    let(:user_is_locked_out?) {false}
    let(:user_is_in_grace_period?) {false}
    let(:user_predates_policy?) {true}
    let(:user_state_policy_lockout_date) {DateTime.now}
    let(:user_state_policy) {{lockout_date: user_state_policy_lockout_date}}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount.stubs(:compliant?).with(user).returns(user_is_cap_compliant?)
      Policies::ChildAccount::ComplianceState.stubs(:locked_out?).with(user).returns(user_is_locked_out?)
      Policies::ChildAccount::ComplianceState.stubs(:grace_period?).with(user).returns(user_is_in_grace_period?)
      Policies::ChildAccount.stubs(:user_predates_policy?).with(user).returns(user_predates_policy?)
      Policies::ChildAccount.stubs(:state_policy).with(user).returns(user_state_policy)
    end

    it 'returns true' do
      _(eligible?).must_equal true
    end

    context 'when user is CAP compliant' do
      let(:user_is_cap_compliant?) {true}

      it 'returns false' do
        _(eligible?).must_equal false
      end
    end

    context 'when user is locked out' do
      let(:user_is_locked_out?) {true}

      it 'returns false' do
        _(eligible?).must_equal false
      end
    end

    context 'when user is already in grace period' do
      let(:user_is_in_grace_period?) {true}

      it 'returns false' do
        _(eligible?).must_equal false
      end
    end

    context 'when user does not predate policy' do
      let(:user_predates_policy?) {false}

      it 'returns false' do
        _(eligible?).must_equal false
      end
    end

    context 'when user in not covered by any state policy' do
      let(:user_state_policy) {nil}

      it 'returns false' do
        _(eligible?).must_equal false
      end
    end

    context 'when state policy all users lockout phase has not started yet' do
      let(:user_state_policy_lockout_date) {1.second.from_now}

      it 'returns false' do
        _(eligible?).must_equal false
      end
    end
  end
end
