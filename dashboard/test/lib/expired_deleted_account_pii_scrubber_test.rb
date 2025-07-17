require 'test_helper'

class ExpiredDeletedAccountPiiScrubberTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_class) {ExpiredDeletedAccountPiiScrubber}
  let(:described_instance) {described_class.new(options)}
  let(:options) {{}}
  let(:user) {create(:user, :deleted)}

  describe '#scrub_pii_from_expired_deleted_accounts!' do
    subject(:scrub_pii) {described_instance.scrub_pii_from_expired_deleted_accounts!}

    before do
      user.update(deleted_at: 29.days.ago)
      Cdo::Metrics.stubs(:push)
      ChatClient.stubs(:message)
      Honeybadger.stubs(:notify)
    end

    it 'should run the PII scrub service on expired deleted accounts' do
      expect(Services::User::PiiScrubber).to receive(:call).with(user: user)
      scrub_pii
    end

    it 'should increment num_accounts_scrubbed' do
      scrub_pii
      _(described_instance.num_accounts_scrubbed).must_equal 1
    end

    it 'should upload metrics' do
      expect(Cdo::Metrics).to receive(:push)
      scrub_pii
    end

    context 'when dry run' do
      let(:options) {{dry_run: true}}

      it 'should not call the PII scrub service' do
        expect(Services::User::PiiScrubber).not_to receive(:call)
        scrub_pii
      end
    end

    context 'when an error occurs' do
      before do
        expect(described_instance).to receive(:scrub_user).and_raise(Exception.new('Test error'))
      end

      it 'should increment num_errors' do
        scrub_pii
        _(described_instance.num_errors).must_equal 1
      end

      it 'should log the error' do
        expect(described_instance).to receive(:log_message).with(/Error scrubbing user_id #{user.id}: Test error/)
        _(proc {scrub_pii}).must_raise Exception
      end

      it 'should notify Honeybadger' do
        expect(Honeybadger).to receive(:notify).with(
          instance_of(Exception),
          context: {user_id: user.id}
        )
        scrub_pii
      end
    end
  end

  describe '#accounts_to_scrub' do
    subject(:accounts_to_scrub) {described_instance.accounts_to_scrub}

    before do
      user.update(deleted_at: 29.days.ago)
    end

    it 'should return accounts deleted before the scrub cutoff' do
      _(accounts_to_scrub).must_include user
    end

    it 'should not return accounts deleted after the scrub cutoff' do
      user.update(deleted_at: 27.days.ago)
      _(accounts_to_scrub).wont_include user
    end

    context 'when the number of accounts exceeds max_accounts_to_scrub' do
      let(:options) {{max_accounts_to_scrub: 0}}
      it 'should raise a SafetyConstraintViolation' do
        _(proc {accounts_to_scrub}).must_raise described_class::SafetyConstraintViolation
      end
    end
  end
end
