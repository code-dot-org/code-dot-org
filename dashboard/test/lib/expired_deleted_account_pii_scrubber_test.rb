require 'test_helper'

class ExpiredDeletedAccountPiiScrubberTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_class) {ExpiredDeletedAccountPiiScrubber}
  let(:described_instance) {described_class.new(dry_run: dry_run, deleted_since: deleted_since, limit: limit)}
  let(:dry_run) {false}
  let(:deleted_since) {User::SOFT_DELETED_RECORD_TTL.ago}
  let(:limit) {described_class::ACCOUNT_SCRUB_LIMIT}
  let(:user) {create(:user, :deleted)}
  let(:older_than_ttl_date) {(User::SOFT_DELETED_RECORD_TTL + 1.day).ago}
  let(:newer_than_ttl_date) {(User::SOFT_DELETED_RECORD_TTL - 1.day).ago}

  describe '#call' do
    subject(:scrub_pii) {described_instance.call}

    before do
      user.update(deleted_at: older_than_ttl_date)
      Cdo::Metrics.stubs(:push)
      ChatClient.stubs(:message)
      Honeybadger.stubs(:notify)
    end

    it 'uses the reporting role for batch queries' do
      roles_seen = []

      subscriber = ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
        payload = args.last
        sql = payload[:sql]
        # Capture only the batch SELECT from the loop (has LIMIT against users)
        if sql =~ /FROM\s+`users`/i && sql =~ /LIMIT/i
          roles_seen << ActiveRecord::Base.current_role
        end
      end

      begin
        # Run in dry_run mode to avoid writes; ensure at least one eligible record exists
        # described_instance = described_class.new(dry_run: true, deleted_since: described_instance.deleted_since, limit: described_class::ACCOUNT_SCRUB_LIMIT)
        expect(Services::User::PiiScrubber).to receive(:call).with(user: user)
        # described_instance.call
        scrub_pii
      ensure
        ActiveSupport::Notifications.unsubscribe(subscriber)
      end

      _(roles_seen).wont_be_empty
      _(roles_seen.uniq).must_equal [:reporting]
    end

    it 'runs the PII scrub service on expired deleted accounts' do
      expect(Services::User::PiiScrubber).to receive(:call).with(user: user)
      scrub_pii
    end

    it 'increments num_accounts_scrubbed' do
      scrub_pii
      _(described_instance.send(:num_accounts_scrubbed)).must_equal 1
    end

    it 'uploads metrics' do
      expect(Cdo::Metrics).to receive(:push)
      scrub_pii
    end

    context 'when dry run' do
      let(:dry_run) {true}

      it 'does not call the PII scrub service' do
        expect(Services::User::PiiScrubber).not_to receive(:call)
        scrub_pii
      end
    end

    context 'when an error occurs' do
      before do
        expect(described_instance).to receive(:scrub_user).and_raise(StandardError.new('Test error'))
      end

      it 'increments num_errors' do
        scrub_pii
        _(described_instance.send(:num_errors)).must_equal 1
      end

      it 'notifies Honeybadger' do
        expect(Honeybadger).to receive(:notify).with(
          instance_of(StandardError),
          context: {user_id: user.id}
        )
        scrub_pii
      end
    end

    context 'when the number of accounts exceeds limit' do
      let(:limit) {0}
      it 'raises a SafetyConstraintViolation' do
        _(proc {scrub_pii}).must_raise described_class::SafetyConstraintViolation
      end
    end
  end

  describe '#accounts_to_scrub' do
    subject(:accounts_to_scrub) {described_instance.accounts_to_scrub}

    before do
      user.update(deleted_at: older_than_ttl_date)
    end

    it 'returns accounts deleted before the scrub cutoff' do
      _(accounts_to_scrub).must_include user
    end

    it 'does not return accounts deleted after the scrub cutoff' do
      user.update(deleted_at: newer_than_ttl_date)
      _(accounts_to_scrub).wont_include user
    end

    it 'does not include accounts from processed_user_ids' do
      described_instance.processed_user_ids << user.id
      _(accounts_to_scrub).wont_include user
    end
  end
end
