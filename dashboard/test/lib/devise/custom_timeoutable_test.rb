require 'test_helper'

class Devise::Models::CustomTimeoutableTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::TimeHelpers

  subject(:user) {build_stubbed(:user)}
  let(:timeout) {Devise.timeout_in}
  let(:last_activity_at) {Time.current}

  describe '#timeout_in' do
    it 'returns the correct default value' do
      _(user.timeout_in).must_equal timeout
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
