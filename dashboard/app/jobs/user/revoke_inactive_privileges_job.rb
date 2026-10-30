# frozen_string_literal: true

require 'cdo/chat_client'

class User
  # Revokes admin and the levelbuilder permission from accounts that have not
  # signed in for INACTIVITY_PERIOD.
  class RevokeInactivePrivilegesJob < ApplicationJob
    queue_as :default

    INACTIVITY_PERIOD = 1.year
    SLACK_CHANNEL = 'cron-daily'

    def perform(dry_run: false)
      cutoff = INACTIVITY_PERIOD.ago
      admin_ids, levelbuilder_ids = ActiveRecord::Base.connected_to(role: :reporting) do
        [inactive_admins(cutoff).pluck(:id), inactive_levelbuilders(cutoff).pluck(:user_id)]
      end

      # User ids only: this log is the audit record, and emails are PII.
      log_info('revoke_inactive_privileges_candidates', dry_run:, cutoff: cutoff.iso8601, admin_user_ids: admin_ids, levelbuilder_user_ids: levelbuilder_ids)
      return if dry_run

      admins, admin_failures = revoke('admin', admin_ids) {|id| revoke_admin(id)}
      levelbuilders, levelbuilder_failures = revoke(UserPermission::LEVELBUILDER, levelbuilder_ids) {|id| revoke_levelbuilder(id)}
      log_info('revoke_inactive_privileges_revoked', admin_user_ids: admins, levelbuilder_user_ids: levelbuilders)

      failures = admin_failures.size + levelbuilder_failures.size
      return if admins.empty? && levelbuilders.empty? && failures.zero?

      message = "#{rack_env}: revoked admin from #{admins.size} and levelbuilder from #{levelbuilders.size} " \
        "accounts with no sign-in for #{INACTIVITY_PERIOD.inspect}."
      if failures.zero?
        ChatClient.message(SLACK_CHANNEL, message)
      else
        ChatClient.message(SLACK_CHANNEL, "#{message} #{failures} failed; see the revoke_inactive_privilege_failed log events.", color: 'red')
      end
    end

    private def inactive_users(cutoff)
      User.
        where(created_at: ...cutoff).
        where('users.current_sign_in_at IS NULL OR users.current_sign_in_at < ?', cutoff)
    end

    # Devise sets last_sign_in_at to the previous sign-in, so current_sign_in_at is the latest.
    private def inactive_admins(cutoff)
      inactive_users(cutoff).where(admin: true)
    end

    # A grant newer than the cutoff is kept even if the account is old, so new grantees have time to sign in.
    private def inactive_levelbuilders(cutoff)
      UserPermission.
        where(permission: UserPermission::LEVELBUILDER, created_at: ...cutoff).
        joins(:user).
        merge(inactive_users(cutoff))
    end

    # Returns [revoked user ids, failed user ids].
    private def revoke(privilege, user_ids)
      revoked = []
      failed = []
      user_ids.each do |user_id|
        revoked << user_id if yield(user_id)
      rescue => exception
        failed << user_id
        CDO.log.error JSON.dump(event: 'revoke_inactive_privilege_failed', privilege:, user_id:, error: exception.message)
      end
      [revoked, failed]
    end

    # Saves through callbacks, which post the change to #infra-security.
    private def revoke_admin(user_id)
      user = User.find_by(id: user_id, admin: true)
      return false unless user
      user.update_attribute(:admin, false) || raise('save halted by a callback')
    end

    # Destroys through callbacks, which post the change to #infra-security.
    private def revoke_levelbuilder(user_id)
      permission = UserPermission.find_by(user_id:, permission: UserPermission::LEVELBUILDER)
      return false unless permission
      permission.destroy!
    end

    private def log_info(event, **fields)
      CDO.log.info JSON.dump(event:, **fields)
    end
  end
end
