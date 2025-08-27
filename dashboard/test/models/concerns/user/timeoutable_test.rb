require 'test_helper'

class User::TimeoutableTest < ActiveSupport::TestCase
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
    it 'returns false' do
      _(user.timedout?(last_activity_at)).must_equal false
    end

    context 'when timed out' do
      it 'returns true' do
        travel_to(last_activity_at + timeout + 1.minute) do
          _(user.timedout?(last_activity_at)).must_equal true
        end
      end
    end
  end
end
