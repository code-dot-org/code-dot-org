require 'test_helper'

class User::InactiveUserDeleterTest < ActiveJob::TestCase
  include Minitest::RSpecMocks

  subject(:described_class) {InactiveUserDeleter}
  subject(:described_instance) {described_class.new(dry_run: dry_run, inactive_since: inactive_since, limit: limit)}

  let(:dry_run) {false}
  let(:inactive_since) {described_class::INACTIVE_USER_TTL.ago}
  let(:limit) {nil}

  let(:email) {Faker::Internet.unique.email}
  let!(:student) {create(:student, current_sign_in_at: inactive_since - 1.day)}
  let!(:teacher) {create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: user_data_retention_status)}
  let!(:user_data_retention_status) {create(:user_data_retention_status, deletion_warning_email_sent_at: deletion_warning_email_sent_at)}
  let(:deletion_warning_email_sent_at) {42.days.ago}

  let(:expect_event_logging) do
    Metrics::Events.expects(:log_event).with(
      event_name: 'inactive_user_deleter',
      metadata: {
        num_accounts_deleted: 2,
        num_errors: 0,
      },
    )
  end

  describe '#call' do
    subject(:delete_inactive_users) {described_instance.call}

    before do
      ChatClient.stubs(:message)
      Honeybadger.stubs(:notify)
    end

    it 'soft deletes all inactive users' do
      delete_inactive_users
      student.reload
      teacher.reload
      _(student.deleted?).must_equal true
      _(teacher.deleted?).must_equal true
    end

    it 'soft deletes inactive user that never signed in' do
      user = create(:user, current_sign_in_at: nil, created_at: inactive_since)

      delete_inactive_users
      user.reload
      _(user.deleted?).must_equal true
    end

    it 'does not soft delete active user that never signed in' do
      user = create(:user, current_sign_in_at: nil, created_at: inactive_since + 1.day)

      delete_inactive_users
      user.reload
      _(user.deleted?).must_equal false
    end

    it 'does not process already soft-deleted users' do
      soft_deleted_user = create(:student)
      soft_deleted_user.destroy!

      delete_inactive_users

      _(described_instance.processed_user_ids).wont_include soft_deleted_user.id
    end

    it 'does not delete active users' do
      active_user = create(:user)

      delete_inactive_users
      active_user.reload

      _(active_user.deleted?).must_equal false
    end

    it 'does not delete inactive teachers who have not been sent deletion warning email' do
      teacher_no_warning = create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: create(:user_data_retention_status, deletion_warning_email_sent_at: nil))
      delete_inactive_users
      teacher_no_warning.reload
      _(teacher_no_warning.deleted?).must_equal false
    end

    it 'does not delete inactive teachers who have been sent deletion warning email less than 30 days ago' do
      teacher_recent_warning = create(:teacher, current_sign_in_at: inactive_since - 1.day, user_data_retention_status: create(:user_data_retention_status, deletion_warning_email_sent_at: 29.days.ago))
      delete_inactive_users
      teacher_recent_warning.reload
      _(teacher_recent_warning.deleted?).must_equal false
    end

    it 'increments num_accounts_deleted' do
      delete_inactive_users
      _(described_instance.send(:num_accounts_deleted)).must_equal 2
    end

    it 'uploads metrics' do
      expect_event_logging.once
      delete_inactive_users
    end

    context 'when limit is provided' do
      let(:limit) {1}
      it 'limits the inactive users query to the specified limit' do
        delete_inactive_users
        _(described_instance.limit).must_equal 1
        _(described_instance.send(:num_accounts_deleted)).must_equal 1
      end
    end

    context 'when no limit is provided' do
      let(:limit) {nil}
      it 'defaults to the ACCOUNT_DELETION_LIMIT' do
        _(described_instance.limit).must_equal described_class::ACCOUNT_DELETION_LIMIT
      end
    end

    context 'when dry run' do
      let(:dry_run) {true}
      it 'does not destroy users in dry run mode' do
        User.any_instance.expects(:destroy!).never
        delete_inactive_users
      end
    end

    context 'when an error occurs' do
      before do
        expect(described_instance).to receive(:delete_user).and_raise(StandardError.new('Test error')).twice
      end

      it 'increments num_errors' do
        delete_inactive_users
        _(described_instance.send(:num_errors)).must_equal 2
      end

      it 'notifies Honeybadger' do
        expect(Honeybadger).to receive(:notify).twice
        delete_inactive_users
      end
    end

    describe '#inactive_users' do
      subject(:inactive_users) {described_instance.inactive_users}

      it 'returns inactive accounts' do
        _(inactive_users).must_include student
      end

      it 'does not return active accounts' do
        active_student = create(:student)
        _(inactive_users).wont_include active_student
      end

      it 'does not include accounts from processed_user_ids' do
        described_instance.processed_user_ids << student.id
        _(inactive_users).wont_include student
      end
    end
  end
end
