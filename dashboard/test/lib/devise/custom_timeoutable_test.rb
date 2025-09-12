require 'test_helper'

class Devise::Models::CustomTimeoutableTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::TimeHelpers
  include Minitest::RSpecMocks

  subject(:user) {build_stubbed(:user)}
  let(:timeout) {Devise.timeout_in}
  let(:last_activity_at) {Time.current}

  describe '#timeout_in' do
    subject(:timeout_in) {user.timeout_in}

    it 'sets the value based on CDO config' do
      _(timeout).must_equal CDO.dashboard_session_ttl_days.days
    end

    it 'returns the correct default value' do
      _(timeout_in).must_equal timeout
    end

    context 'when restricted user' do
      before do
        expect(Policies::Lti).to receive(:restricted_user?).with(user).and_return(true)
      end

      it 'returns 24 hours' do
        _(timeout_in).must_equal Devise::Models::CustomTimeoutable::RESTRICTED_USER_TIMEOUT
      end
    end
  end

  describe '#timedout?' do
    subject(:timedout?) {user.timedout?(last_activity_at)}

    it 'returns false' do
      _(timedout?).must_equal false
    end

    context 'when timed out' do
      around do |test|
        travel_to(last_activity_at + timeout + 1.minute) {test.call}
      end

      it 'returns true' do
        _(timedout?).must_equal true
      end
    end
  end
end
