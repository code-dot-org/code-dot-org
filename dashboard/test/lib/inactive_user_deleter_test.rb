require 'test_helper'

class User::InactiveUserDeleterTest < ActiveJob::TestCase
  include Minitest::RSpecMocks

  subject(:described_class) {InactiveUserDeleter}
  subject(:described_instance) {described_class.new(dry_run: dry_run, inactive_since: inactive_since, limit: limit)}

  let(:dry_run) {false}
  let(:inactive_since) {described_class::INACTIVE_USER_TTL.ago}
  let(:limit) {described_class::ACCOUNT_DELETION_LIMIT}

  let(:email) {Faker::Internet.unique.email}
  let!(:student) {create(:student, current_sign_in_at: 42.months.ago - 1.day)}
  let!(:teacher) {create(:teacher, current_sign_in_at: 42.months.ago - 1.day)}

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
      #User.any_instance.expects(:destroy!).twice
      delete_inactive_users
      student.reload
      teacher.reload
      _(student.deleted_at).wont_be_nil
      _(teacher.deleted_at).wont_be_nil
    end

    it 'does not delete active users' do
      active_user = create(:user)

      delete_inactive_users
      active_user.reload

      _(active_user.deleted_at).must_be_nil
    end

    it 'does not delete already soft-deleted user' do
      soft_deleted_user = create(:user, deleted_at: 1.day.ago)

      delete_inactive_users
      soft_deleted_user.reload

      _(soft_deleted_user.deleted_at).wont_be_nil
      _(soft_deleted_user.deleted_at.to_date).must_equal 1.day.ago.to_date
    end

    it 'increments num_accounts_scrubbed' do
      delete_inactive_users
      _(described_instance.send(:num_accounts_deleted)).must_equal 2
    end

    it 'uploads metrics' do
      expect_event_logging.once
      delete_inactive_users
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
