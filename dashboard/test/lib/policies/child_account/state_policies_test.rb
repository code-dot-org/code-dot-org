require 'test_helper'

class Policies::ChildAccount::StatePoliciesTest < ActiveSupport::TestCase
  describe '#state_policies' do
    let(:state_policies) {Policies::ChildAccount::StatePolicies.state_policies}

    around do |test|
      Timecop.freeze {test.call}
    end

    describe 'for Colorado' do
      let(:state_policy) {state_policies['CO']}
      let(:start_date) {DateTime.parse('2023-07-05T23:15:00+00:00')}
      let(:lockout_date) {DateTime.parse('2024-07-01T00:00:00MDT')}

      it 'contains expected max age' do
        _(state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(state_policy[:name]).must_equal 'CPA'
      end

      it 'contains expected grace_period_duration' do
        _(state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(state_policy[:start_date]).must_equal start_date
      end

      it 'contains expected default lockout_date' do
        _(state_policy[:lockout_date]).must_equal lockout_date
      end
    end

    describe 'for Delaware' do
      let(:state_policy) {state_policies['DE']}
      let(:start_date) {DateTime.parse('2025-01-06T00:00:00-05:00')}
      let(:lockout_date) {DateTime.parse('2025-01-06T00:00:00-05:00')}

      it 'contains expected max age' do
        _(state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(state_policy[:name]).must_equal 'DPDPA'
      end

      it 'contains expected grace_period_duration' do
        _(state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(state_policy[:start_date]).must_equal start_date
      end

      it 'contains expected default lockout_date' do
        _(state_policy[:lockout_date]).must_equal lockout_date
      end
    end

    describe 'for New York' do
      let(:state_policy) {state_policies['NY']}
      let(:start_date) {DateTime.parse('2025-06-20T00:00:00-04:00')}
      let(:lockout_date) {DateTime.parse('2025-06-20T00:00:00-04:00')}

      it 'contains expected max age' do
        _(state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(state_policy[:name]).must_equal 'NYCDPA'
      end

      it 'contains expected grace_period_duration' do
        _(state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(state_policy[:start_date]).must_equal start_date
      end

      it 'contains expected default lockout_date' do
        _(state_policy[:lockout_date]).must_equal lockout_date
      end
    end

    describe 'for Oregon' do
      let(:state_policy) {state_policies['OR']}
      let(:start_date) {DateTime.parse('2025-07-01T00:00:00-07:00')}
      let(:lockout_date) {DateTime.parse('2025-07-01T00:00:00-07:00')}

      it 'contains expected max age' do
        _(state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(state_policy[:name]).must_equal 'OCPA'
      end

      it 'contains expected grace_period_duration' do
        _(state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(state_policy[:start_date]).must_equal start_date
      end

      it 'contains expected default lockout_date' do
        _(state_policy[:lockout_date]).must_equal lockout_date
      end
    end

    describe 'for Minnesota' do
      let(:state_policy) {state_policies['MN']}
      let(:start_date) {DateTime.parse('2025-07-31T00:00:00-05:00')}
      let(:lockout_date) {DateTime.parse('2025-07-31T00:00:00-05:00')}

      it 'contains expected max age' do
        _(state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(state_policy[:name]).must_equal 'MCDPA'
      end

      it 'contains expected grace_period_duration' do
        _(state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(state_policy[:start_date]).must_equal start_date
      end

      it 'contains expected default lockout_date' do
        _(state_policy[:lockout_date]).must_equal lockout_date
      end
    end

    describe 'for Maryland' do
      let(:state_policy) {state_policies['MD']}
      let(:start_date) {DateTime.parse('2025-10-01T00:00:00-04:00')}
      let(:lockout_date) {DateTime.parse('2025-10-01T00:00:00-04:00')}

      it 'contains expected max age' do
        _(state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(state_policy[:name]).must_equal 'MODPA'
      end
      it 'contains expected grace_period_duration' do
        _(state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(state_policy[:start_date]).must_equal start_date
      end

      it 'contains expected default lockout_date' do
        _(state_policy[:lockout_date]).must_equal lockout_date
      end
    end
  end
end
