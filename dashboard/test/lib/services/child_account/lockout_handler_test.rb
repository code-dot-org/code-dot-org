require 'test_helper'

class Services::ChildAccount::LockoutHandlerTest < ActiveSupport::TestCase
  let(:described_class) {Services::ChildAccount::LockoutHandler}
  let(:described_instance) {described_class.new(user: user)}

  let(:user) {build_stubbed(:student)}

  it 'inherits from Services::Base' do
    _(described_class.superclass).must_equal Services::Base
  end

  describe '#call' do
    let(:handle_user_lockout) {described_instance.call}

    let(:user_is_locked_out?) {false}
    let(:user_is_cap_compliant?) {false}
    let(:user_lockout_date) {DateTime.now}

    let(:expect_user_locking_out) {Services::ChildAccount.expects(:lock_out).with(user)}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount::ComplianceState.stubs(:locked_out?).with(user).returns(user_is_locked_out?)
      Policies::ChildAccount.stubs(:compliant?).with(user).returns(user_is_cap_compliant?)
      Policies::ChildAccount.stubs(:lockout_date).with(user).returns(user_lockout_date)
      Services::ChildAccount.stubs(:lock_out).with(user)
    end

    it 'locks out user ' do
      expect_user_locking_out.once
      handle_user_lockout
    end

    it 'returns true' do
      _(handle_user_lockout).must_equal true
    end

    context 'when user lockout date has not come yet' do
      let(:user_lockout_date) {1.second.from_now}

      it 'does not lock out user' do
        expect_user_locking_out.never
        handle_user_lockout
      end

      it 'returns false' do
        _(handle_user_lockout).must_equal false
      end
    end

    context 'when user has no lockout date' do
      let(:user_lockout_date) {nil}

      it 'does not lock out user' do
        expect_user_locking_out.never
        handle_user_lockout
      end

      it 'returns false' do
        _(handle_user_lockout).must_equal false
      end
    end

    context 'when user is CAP compliant' do
      let(:user_is_cap_compliant?) {true}

      it 'does not lock out user' do
        expect_user_locking_out.never
        handle_user_lockout
      end

      it 'returns false' do
        _(handle_user_lockout).must_equal false
      end
    end

    context 'when user is already locked out' do
      let(:user_is_locked_out?) {true}

      it 'does not lock out user' do
        expect_user_locking_out.never
        handle_user_lockout
      end

      it 'returns true' do
        _(handle_user_lockout).must_equal true
      end

      context 'but also CAP compliant now' do
        let(:user_is_cap_compliant?) {true}

        it 'still returns true' do
          _(handle_user_lockout).must_equal true
        end
      end
    end
  end
end
