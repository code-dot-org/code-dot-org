require 'test_helper'

class CAP::LockoutJobTest < ActiveJob::TestCase
  let(:described_class) {CAP::LockoutJob}
  let(:described_instance) {described_class.new}

  describe '.schedule_for' do
    let(:schedule_lockout_for_user) {described_class.schedule_for(user)}

    let(:user) {build_stubbed(:user)}

    let(:user_estimated_lockout_date) {DateTime.now}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount.stubs(:lockout_date).with(user).returns(user_estimated_lockout_date)
    end

    it 'schedules lockout job for user based on their estimated lockout date with one rescheduling attempt by default' do
      assert_enqueued_with job: described_class, args: [user_id: user.id, reschedules: 1], at: user_estimated_lockout_date.since(1.minute) do
        schedule_lockout_for_user
      end
    end

    it 'returns scheduled lockout job' do
      _(schedule_lockout_for_user).must_be_instance_of described_class
    end

    context 'when reschedule attempts number is set' do
      let(:schedule_lockout_for_user) {described_class.schedule_for(user, reschedules: reschedule_attempts_number)}

      let(:reschedule_attempts_number) {999}

      it 'schedules lockout job for user with set number of rescheduling attempts' do
        assert_enqueued_with job: described_class, args: [user_id: user.id, reschedules: reschedule_attempts_number] do
          schedule_lockout_for_user
        end
      end
    end

    context 'when user has no estimated lockout date' do
      let(:user_estimated_lockout_date) {nil}

      it 'does not schedule lockout job for user' do
        assert_no_enqueued_jobs do
          schedule_lockout_for_user
        end
      end

      it 'returns nil' do
        _(schedule_lockout_for_user).must_be_nil
      end
    end
  end

  describe '#perform' do
    let(:perform_user_lockout_job) {described_instance.perform(user_id: user.id)}

    let(:user) {create(:user)}

    let(:user_has_been_locked_out) {true}

    before do
      Services::ChildAccount::LockoutHandler.stubs(:call).with(user: user).returns(user_has_been_locked_out)
    end

    it 'calls the LockoutHandler for user' do
      Services::ChildAccount::LockoutHandler.expects(:call).with(user: user).once
      perform_user_lockout_job
    end

    it 'does not reschedule the lockout job' do
      described_class.expects(:schedule_for).with(user, anything).never
      perform_user_lockout_job
    end

    context 'when user has not been locked out' do
      let(:user_has_been_locked_out) {false}

      it 'does not reschedule the lockout job by default' do
        described_class.expects(:schedule_for).with(user, anything).never
        perform_user_lockout_job
      end

      context 'when reschedule attempts number is set' do
        let(:perform_user_lockout_job) {described_instance.perform(user_id: user.id, reschedules: reschedule_attempts_number)}

        let(:reschedule_attempts_number) {1}

        it 'reschedules the lockout job with decreasing the next rescheduling attempts number by one' do
          described_class.expects(:schedule_for).with(user, reschedules: reschedule_attempts_number - 1).once
          perform_user_lockout_job
        end
      end
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
