require 'test_helper'

class Queries::User::ExpiredDeletedAccountsTest < ActiveSupport::TestCase
  describe '#call' do
    let(:described_instance) {described_class.new(deleted_before: deleted_before)}
    let(:deleted_before) {28.days.ago}
    let(:expected_user) {create(:user, :deleted)}
    subject(:expired_deleted_accounts) {described_instance.call}

    it 'does not return users who are not soft-deleted' do
      active_user = create(:user, current_sign_in_at: Time.now)
      _(expired_deleted_accounts).wont_include active_user
    end

    it 'returns users who have been soft-deleted before the specified date' do
      expected_user.update(deleted_at: deleted_before - 1.day)
      _(expired_deleted_accounts).must_include expected_user
    end

    it 'does not return users who have been soft-deleted after the specified date' do
      _(expired_deleted_accounts).wont_include expected_user
    end

    it 'returns an empty relation when no users meet the criteria' do
      _(expired_deleted_accounts).must_be_empty
    end

    context 'when user already scrubbed of PII' do
      before do
        expected_user.update(deleted_at: deleted_before - 1.day)
        create :user_data_retention_status, user: expected_user, pii_scrubbed_at: Time.now
      end

      it 'does not return the user' do
        create :user_data_retention_status, user: expected_user, pii_scrubbed_at: Time.now
        _(expired_deleted_accounts).wont_include expected_user
      end
    end

    context 'when user already purged' do
      before do
        expected_user.update(deleted_at: deleted_before - 1.day, purged_at: Time.now)
      end

      it 'does not return the user' do
        _(expired_deleted_accounts).wont_include expected_user
      end
    end

    context 'when user already anonymized' do
      before do
        expected_user.update(deleted_at: deleted_before - 1.day)
        create :user_data_retention_status, user: expected_user, anonymized_at: Time.now
      end

      it 'does not return the user' do
        _(expired_deleted_accounts).wont_include expected_user
      end
    end

    context 'when deleted_before is not a Date or Time' do
      let(:deleted_before) {2025}

      it 'raises an ArgumentError' do
        _(-> {expired_deleted_accounts}).must_raise ArgumentError
      end
    end
  end
end
