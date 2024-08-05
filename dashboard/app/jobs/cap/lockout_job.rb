module CAP
  # Attempts to transition the User to the locked-out state if they
  # should no longer be able to access Code.org due to their State's
  # Child Account Policy.
  class LockoutJob < ApplicationJob
    MAX_RESCHEDULING_ATTEMPTS = 1

    rescue_from StandardError, with: :report_exception

    # Schedules the user lockout based on their estimated lockout date.
    # @param user [User] the student account
    # @param reschedules [Integer] the number of times the job can be rescheduled
    # @return [CAP::LockoutJob, nil] the scheduled lockout job on success, nil otherwise
    def self.schedule_for(user, reschedules: MAX_RESCHEDULING_ATTEMPTS)
      estimated_lockout_date = Policies::ChildAccount.lockout_date(user)
      return unless estimated_lockout_date

      # Schedules the lockout job to run one minute later
      # to ensure it does not perform before the estimated lockout time.
      scheduled_lockout_date = estimated_lockout_date.since(1.minute)
      set(wait_until: scheduled_lockout_date).perform_later(user_id: user.id, reschedules: reschedules)
    end

    # @param user_id [Integer] the student account ID
    # @param reschedules [Integer] the number of times the job can be rescheduled due to a lockout failure
    def perform(user_id:, reschedules: 0)
      user = User.find(user_id)

      user_is_locked_out = Services::ChildAccount::LockoutHandler.call(user: user)

      # If the user was not locked out, attempt to reschedule the lockout job
      # in case the reason is a re-estimation of the user's lockout date.
      self.class.schedule_for(user, reschedules: reschedules.pred) unless user_is_locked_out || reschedules <= 0
    end

    private def report_exception(exception)
      Honeybadger.notify(
        exception,
        error_message: '[CAP::LockoutJob] Runtime error',
        context: {
          job: as_json,
        }
      )
    ensure
      raise exception
    end
  end
end
