# frozen_string_literal: true

require 'cdo/chat_client'

class User
  # Revokes admin from accounts that have not signed in for INACTIVITY_PERIOD.
  class DemoteExpiredAdminsJob < ApplicationJob
    queue_as :default

    INACTIVITY_PERIOD = 90.days
    SLACK_CHANNEL = 'cron-daily'

    def perform(dry_run: false)
      cutoff = INACTIVITY_PERIOD.ago
      user_ids = expired_admins(cutoff).pluck(:id)

      # Ids only: this log is the audit record, and emails are PII.
      CDO.log.info JSON.dump(
        event: 'demote_expired_admins',
        dry_run:,
        cutoff: cutoff.iso8601,
        user_ids:,
      )
      return if dry_run || user_ids.empty?

      count = User.where(id: user_ids, admin: true).update_all(admin: false, updated_at: Time.now)
      ChatClient.message(SLACK_CHANNEL, "Revoked admin privileges for #{count} accounts with no sign-in for #{INACTIVITY_PERIOD.inspect}.")
    end

    # Devise sets last_sign_in_at to the previous sign-in, so current_sign_in_at is the latest.
    private def expired_admins(cutoff)
      User.
        where(admin: true).
        where(created_at: ...cutoff).
        where('current_sign_in_at IS NULL OR current_sign_in_at < ?', cutoff)
    end
  end
end
