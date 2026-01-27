require 'test_helper'

class InactivityCleanup::StudentDeleterTest < ActiveSupport::TestCase
  subject(:described_instance) {InactivityCleanup::StudentDeleter.new(**described_instance_args)}

  let(:described_instance_args) {{}}

  before do
    ChatClient.stubs(:message)
    Metrics::Events.stubs(:log_event)
    Honeybadger.stubs(:notify)
  end

  describe '#call' do
    subject(:delete_inactive_students) {described_instance.call}

    let!(:account) {create(:student, created_at: InactivityCleanup::INACTIVITY_THRESHOLD.ago, current_sign_in_at: nil)}

    around do |test|
      Timecop.freeze {test.call}
    end

    shared_examples_for 'deletes account' do
      it 'deletes account' do
        _ {delete_inactive_students}.must_change -> {account.reload.deleted?}, from: false, to: true
        _(described_instance.num_errors).must_equal 0
        _(described_instance.num_accounts_deleted).must_equal 1
        _(described_instance.processed_user_ids).must_include account.id
      end

      it 'uploads metrics' do
        Metrics::Events.expects(:log_event).with(
          event_name: 'inactive_student_deleter',
          metadata: {
            num_accounts_deleted: 1,
            num_errors: 0,
          }
        ).once

        delete_inactive_students
      end

      it 'logs to slack' do
        ChatClient.expects(:message).with do |channel, message, options|
          _(channel).must_equal 'cron-daily'
          _(message).must_equal <<~MSG.chomp
            *InactivityCleanup::StudentDeleter Cronjob*
            <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/inactivity_cleanup|(source)>
            Deleted 1 accounts
            Duration 00:00:00
          MSG
          _(options).must_equal({})
        end.once

        delete_inactive_students
      end

      it 'returns summary' do
        _delete_inactive_students.must_equal <<~MSG.chomp
          Deleted 1 accounts
          Duration 00:00:00
        MSG
      end
    end

    shared_examples_for 'ignores account' do |num_errors: 0|
      it 'does not delete account' do
        _ do
          _ {delete_inactive_students}.wont_change -> {account.reload.deleted?}
        end.wont_change -> {described_instance.num_accounts_deleted}

        _(described_instance.num_errors).must_equal num_errors

        if num_errors.zero?
          _(described_instance.processed_user_ids).wont_include account.id
        else
          _(described_instance.processed_user_ids).must_include account.id
        end
      end

      it 'uploads metrics' do
        Metrics::Events.expects(:log_event).with(
          event_name: 'inactive_student_deleter',
          metadata: {num_accounts_deleted: 0, num_errors:}
        ).once

        delete_inactive_students
      end

      it 'logs to slack' do
        expected_seq = sequence('slack-messages')
        expected_message =
          if num_errors.zero?
            <<~MSG.chomp
              *InactivityCleanup::StudentDeleter Cronjob*
              <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/inactivity_cleanup|(source)>
              Deleted 0 accounts
              Duration 00:00:00
            MSG
          else
            <<~MSG.chomp
              *InactivityCleanup::StudentDeleter Cronjob*
              <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/inactivity_cleanup|(source)>
              Deleted 0 accounts
              Encountered #{num_errors} errors
              Duration 00:00:00
            MSG
          end

        ChatClient.expects(:message).with('cron-daily', expected_message, {}).in_sequence(expected_seq)
        ChatClient.expects(:message).with('user-accounts', expected_message, {}).in_sequence(expected_seq) if num_errors.positive?

        delete_inactive_students
      end

      it 'returns summary' do
        expected_summary =
          if num_errors.zero?
            <<~MSG.chomp
              Deleted 0 accounts
              Duration 00:00:00
            MSG
          else
            <<~MSG.chomp
              Deleted 0 accounts
              Encountered #{num_errors} errors
              Duration 00:00:00
            MSG
          end

        _delete_inactive_students.must_equal expected_summary
      end
    end

    it_behaves_like 'deletes account'

    context 'when student has been inactive longer than allowed period' do
      let!(:account) {create(:student, created_at: InactivityCleanup::INACTIVITY_THRESHOLD.ago - 1.minute, current_sign_in_at: nil)}

      it_behaves_like 'deletes account'
    end

    context 'when student has been signed in longer than allowed period' do
      let!(:account) {create(:student, current_sign_in_at: InactivityCleanup::INACTIVITY_THRESHOLD.ago)}

      it_behaves_like 'deletes account'
    end

    context 'when student has been signed in within allowed period' do
      let!(:account) {create(:student, current_sign_in_at: InactivityCleanup::INACTIVITY_THRESHOLD.ago + 1.minute)}

      it_behaves_like 'ignores account'
    end

    context 'when inactive student is already deleted' do
      before do
        account.destroy!
      end

      it_behaves_like 'ignores account'
    end

    context 'when account is inactive teacher' do
      let!(:account) {create(:teacher, created_at: InactivityCleanup::INACTIVITY_THRESHOLD.ago, current_sign_in_at: nil)}

      it_behaves_like 'ignores account'
    end

    context 'when something goes wrong during account deletion' do
      let(:error) {StandardError.new('expected error')}

      before do
        Student.any_instance.expects(:destroy!).raises(error)
      end

      it_behaves_like 'ignores account', num_errors: 1

      it 'logs error to Honeybadger' do
        Honeybadger.expects(:notify).with(error, context: {user_id: account.id}).once
        delete_inactive_students
      end
    end

    context 'when dry_run' do
      let(:described_instance_args) {{dry_run: true}}

      it 'does not delete account' do
        _ {delete_inactive_students}.wont_change -> {account.reload.deleted?}
        _(account.deleted?).must_equal false
        _(described_instance.num_errors).must_equal 0
        _(described_instance.num_accounts_deleted).must_equal 1
        _(described_instance.processed_user_ids).must_include account.id
      end

      it 'does not upload metrics' do
        Metrics::Events.expects(:log_event).with(event_name: 'inactive_student_deleter', metadata: anything).never
        delete_inactive_students
      end

      it 'logs to slack' do
        ChatClient.expects(:message).with do |channel, message, options|
          _(channel).must_equal 'cron-daily'
          _(message).must_equal <<~MSG.chomp
            *InactivityCleanup::StudentDeleter Cronjob* (dry-run)
            <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/inactivity_cleanup|(source)>
            Deleted 1 accounts
            Duration 00:00:00
            Dry run, no accounts actually deleted
          MSG
          _(options).must_equal({})
        end.once

        delete_inactive_students
      end

      it 'returns summary' do
        _delete_inactive_students.must_equal <<~MSG.chomp
          Deleted 1 accounts
          Duration 00:00:00
          Dry run, no accounts actually deleted
        MSG
      end
    end

    context 'when provided :inactive_since is before then last account activity' do
      let(:described_instance_args) {{inactive_since: (account.current_sign_in_at || account.created_at) - 1.minute}}

      it_behaves_like 'ignores account'
    end

    context 'when provided :limit is less than inactive account total' do
      let(:described_instance_args) {{limit: 1}}

      let!(:account2) {create(:student, created_at: InactivityCleanup::INACTIVITY_THRESHOLD.ago)}

      it_behaves_like 'deletes account'

      it 'ignores second account' do
        _ {delete_inactive_students}.wont_change -> {account2.reload.deleted?}
        _(described_instance.send(:inactive_users)).must_equal [account2]
        _(described_instance.num_errors).must_equal 0
        _(described_instance.processed_user_ids).wont_include account2.id
      end
    end
  end
end
