require 'test_helper'

class Policies::ChildAccount::StatePoliciesTest < ActiveSupport::TestCase
  describe '#state_policies' do
    let(:state_policies) {Policies::ChildAccount::StatePolicies.state_policies}

    around do |test|
      Timecop.freeze {test.call}
    end

    describe 'for Colorado' do
      let(:co_state_policy) {state_policies['CO']}
      let(:default_start_date) {DateTime.parse('2023-07-05T23:15:00+00:00')}
      let(:default_lockout_date) {DateTime.parse('2024-07-01T00:00:00MDT')}

      it 'contains expected max age' do
        _(co_state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(co_state_policy[:name]).must_equal 'CPA'
      end

      it 'contains expected grace_period_duration' do
        _(co_state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(co_state_policy[:start_date]).must_equal default_start_date
      end

      it 'contains expected default lockout_date' do
        _(co_state_policy[:lockout_date]).must_equal default_lockout_date
      end
    end

    describe 'for Delaware' do
      let(:co_state_policy) {state_policies['DE']}
      let(:default_start_date) {DateTime.parse('2025-01-06T00:00:00-05:00')}
      let(:default_lockout_date) {DateTime.parse('2025-01-06T00:00:00-05:00')}

      it 'contains expected max age' do
        _(co_state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(co_state_policy[:name]).must_equal 'DPDPA'
      end

      it 'contains expected grace_period_duration' do
        _(co_state_policy[:grace_period_duration]).must_equal 14.days
      end

      it 'contains expected default start_date' do
        _(co_state_policy[:start_date]).must_equal default_start_date
      end

      it 'contains expected default lockout_date' do
        _(co_state_policy[:lockout_date]).must_equal default_lockout_date
      end
    end
  end
end
