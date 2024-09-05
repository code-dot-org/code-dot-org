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

    let(:user_is_cap_compliant?) {false}
    let(:user_is_locked_out?) {false}
    let(:user_is_in_grace_period?) {false}
    let(:user_predates_policy?) {true}
    let(:user_state_policy_lockout_date) {DateTime.now}
    let(:user_state_policy) {{lockout_date: user_state_policy_lockout_date}}

    around do |test|
      Timecop.freeze {test.call}
    end

    let(:expect_grace_period_starting) {described_instance.stubs(:start_grace_period)}
    let(:expect_cap_compliance_clearing) {Services::ChildAccount.expects(:remove_compliance).with(user)}

    before do
      Policies::ChildAccount.stubs(:compliant?).with(user).returns(user_is_cap_compliant?)
      Policies::ChildAccount::ComplianceState.stubs(:locked_out?).with(user).returns(user_is_locked_out?)
      Policies::ChildAccount::ComplianceState.stubs(:grace_period?).with(user).returns(user_is_in_grace_period?)
      Policies::ChildAccount.stubs(:user_predates_policy?).with(user).returns(user_predates_policy?)
      Policies::ChildAccount.stubs(:state_policy).with(user).returns(user_state_policy)
    end

    it 'starts grace period for user' do
      expect_grace_period_starting.once
      expect_cap_compliance_clearing.never

      handle_user_grace_period_transition
    end

    context 'when user is already in grace period' do
      let(:user_is_in_grace_period?) {true}

      it 'does nothing' do
        expect_grace_period_starting.never
        expect_cap_compliance_clearing.never

        handle_user_grace_period_transition
      end
    end

    context 'when user is already locked out' do
      let(:user_is_locked_out?) {true}

      it 'does nothing' do
        expect_grace_period_starting.never
        expect_cap_compliance_clearing.never

        handle_user_grace_period_transition
      end
    end

    context 'when user does not predate state policy' do
      let(:user_predates_policy?) {false}

      it 'does nothing' do
        expect_grace_period_starting.never
        expect_cap_compliance_clearing.never

        handle_user_grace_period_transition
      end
    end

    context 'when user is not covered by state policy' do
      let(:user_state_policy) {nil}

      it 'does nothing' do
        expect_grace_period_starting.never
        expect_cap_compliance_clearing.never

        handle_user_grace_period_transition
      end
    end

    context 'when all users lockout phase has not been started yet' do
      let(:user_state_policy_lockout_date) {1.second.since}

      it 'does nothing' do
        expect_grace_period_starting.never
        expect_cap_compliance_clearing.never

        handle_user_grace_period_transition
      end
    end

    context 'when user is CAP compliant' do
      let(:user_is_cap_compliant?) {true}

      it 'does nothing' do
        expect_grace_period_starting.never
        expect_cap_compliance_clearing.never

        handle_user_grace_period_transition
      end

      context 'if user is already in grace period' do
        let(:user_is_in_grace_period?) {true}

        it 'ends grace period for user' do
          expect_grace_period_starting.never
          expect_cap_compliance_clearing.once

          handle_user_grace_period_transition
        end

        context 'and not predates policy anymore' do
          let(:user_predates_policy?) {false}

          it 'ends grace period for user' do
            expect_grace_period_starting.never
            expect_cap_compliance_clearing.once

            handle_user_grace_period_transition
          end
        end
      end
    end
  end

  describe '#start_grace_period' do
    let(:start_grace_period) {described_instance.send(:start_grace_period)}

    let(:scheduled_lockout_job) {stub(:scheduled_lockout_job)}

    let(:expect_grace_period_starting) {Services::ChildAccount.expects(:start_grace_period).with(user)}
    let(:expect_lockout_scheduling) {CAP::LockoutJob.expects(:schedule_for).with(user).returns(scheduled_lockout_job)}

    it 'starts grace period then schedules lockout job' do
      execution_sequence = sequence('execution')

      expect_grace_period_starting.in_sequence(execution_sequence)
      expect_lockout_scheduling.in_sequence(execution_sequence)

      start_grace_period
    end

    context 'when lockout was not scheduled' do
      let(:scheduled_lockout_job) {nil}

      it 'raises LockoutSchedulingError' do
        expect_grace_period_starting.once
        expect_lockout_scheduling.once

        _ {start_grace_period}.must_raise described_class::LockoutSchedulingError
      end
    end
  end
end
