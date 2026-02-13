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

    it 'runs the PII scrub service on expired deleted accounts' do
      expect(Services::User::PiiScrubber).to receive(:call).with(user: user)
      scrub_pii
      _(described_instance.processed_user_ids).must_equal [user.id]
      _(described_instance.num_accounts_scrubbed).must_equal 1
      _(described_instance.user_errors).must_equal({})
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
      let(:error_message) {'Test error'}

      before do
        expect(Services::User::PiiScrubber).to receive(:call).with(user:).and_raise(error_message)
      end

      it 'adds user id to #processed_user_ids' do
        scrub_pii
        _(described_instance.processed_user_ids).must_equal [user.id]
      end

      it 'does not increment #num_accounts_scrubbed' do
        scrub_pii
        _(described_instance.num_accounts_scrubbed).must_equal 0
      end

      it 'adds error message to #user_errors' do
        scrub_pii
        _(described_instance.user_errors).must_equal({user.id => error_message})
      end

      it 'notifies Honeybadger' do
        expect(Honeybadger).to receive(:notify).with(
          'Failed to scrub PII for users',
          context: {num_accounts_scrubbed: 0, user_errors: {user.id => error_message}}
        )
        scrub_pii
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
