module CAP
  class LockoutJob < ApplicationJob
    rescue_from StandardError, with: :report_exception

    # @param user_id [Integer] the student account ID
    def perform(user_id:)
      user = User.find(user_id)
      Services::ChildAccount::LockoutHandler.call(user: user)
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
