# frozen_string_literal: true

class User
  class InactiveUserDeletionJob < ApplicationJob
    LOGGING_NAMESPACE = 'Platform/InactiveUserDeletion'
    def perform(dry_run: false)
      if dry_run
        log_message("Would delete #{inactive_users.count}")
        inactive_users
      else
        count = inactive_users.count
        inactive_users.find_each(&:destroy!)
        log_message("Deleted #{count} users")
      end
    end

    private def inactive_users
      inactive_query = Queries::User::Inactive.new(
        inactive_since: 54.months.ago,
      )
      @inactive_users ||= inactive_query.call
    end

    private def log_message(message)
      CDO.log.info({event: message, namespace: LOGGING_NAMESPACE})
    end
  end
end
