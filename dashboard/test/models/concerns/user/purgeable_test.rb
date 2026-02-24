require 'test_helper'

class PurgeableTest < ActiveSupport::TestCase
  describe 'Attribute delegation' do
    let!(:user) {create(:user)}
    let(:pii_scrubbed_at) {nil}
    let(:anonymized_at) {nil}
    let!(:user_data_retention_status) {create(:user_data_retention_status, user: user, pii_scrubbed_at: pii_scrubbed_at, anonymized_at: anonymized_at)}

    context 'when PII has been scrubbed' do
      let(:pii_scrubbed_at) {Time.zone.now}
      it('delegates pii_scrubbed_at to user_data_retention_status') do
        user.reload
        _(user.pii_scrubbed_at).must_be :present?
      end
    end

    context 'when user is anonymized' do
      let(:anonymized_at) {Time.zone.now}
      it('delegates anonymized_at to user_data_retention_status') do
        user.reload
        _(user.anonymized_at).must_be :present?
      end
    end
  end

  # This functionality is tested more thoroughly in DeleteAccountsHelperTest
  # Later, more purge-related testing functionality may be added/moved here.
  describe '#clear_user_and_mark_purged' do
    let(:user) {create(:user)}
    it('marks user as purged') do
      user.clear_user_and_mark_purged
      _(user.purged_at).must_be :present?
    end
  end

  describe 'SOFT_DELETED_RECORD_TTL guardrail' do
    # This test ensures that the SOFT_DELETED_RECORD_TTL is 28 days, which is important for our
    # data retention policy. If you change this value, please confirm with the platform and infrastructure
    # teams that the change is warranted.
    it 'should be 28 days' do
      _(User::SOFT_DELETED_RECORD_TTL).must_equal 28.days
    end
  end
end
