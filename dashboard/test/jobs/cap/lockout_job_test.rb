require 'test_helper'

class CAP::LockoutJobTest < ActiveJob::TestCase
  let(:described_class) {CAP::LockoutJob}
  let(:described_instance) {described_class.new}

  describe '#perform' do
    let(:perform_user_lockout_job) {described_instance.perform(user_id: user.id)}

    let(:user) {create(:user)}

    it 'calls the LockoutHandler for user' do
      Services::ChildAccount::LockoutHandler.expects(:call).with(user: user).once
      perform_user_lockout_job
    end

    context 'when something went wrong during user locking out' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        Services::ChildAccount::LockoutHandler.stubs(:call).with(user: user).raises(exception)
      end

      it 'reports exception to Honeybadger' do
        Honeybadger.expects(:notify).with(exception, anything).once

        perform_enqueued_jobs do
          _ {described_class.perform_later(user_id: user.id)}.must_raise exception.class
        end

        assert_performed_jobs 1
      end
    end
  end
end
