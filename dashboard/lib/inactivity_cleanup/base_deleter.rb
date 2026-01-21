# frozen_string_literal: true

module InactivityCleanup
  INACTIVITY_THRESHOLD = 42.months

  # Queries for accounts that have been Inactive for more than 3.5 years and soft-deletes them.
  # Logs activity to the user-accounts and cron-daily Slack channels, as well as Cloudwatch.
  class BaseDeleter
    LOGGING_NAMESPACE = 'Platform/InactiveUserDeleter'
    EVENT_NAME = 'inactive_user_deleter'

    SLACK_CHANNEL_FOR_SUMMARY = 'cron-daily'
    SLACK_CHANNEL_FOR_ERRORS = 'user-accounts'

    ACCOUNT_DELETION_LIMIT = 8_000
    BATCH_SIZE = 1_000

    attr_reader :processed_user_ids, :num_accounts_deleted, :num_errors

    # @param dry_run [Boolean] If true, no accounts will actually be deleted.
    # @param inactive_since [Time] The time before which accounts are considered inactive
    #   Defaults to 3.5 years ago, which is the current period before accounts are rendered inactive
    # @param limit [Integer] The maximum number of accounts to delete in a single run.
    #   This is a safety limit to prevent accidental deletion of too many accounts.
    def initialize(dry_run: false, inactive_since: nil, limit: nil)
      @dry_run = dry_run.nil? ? false : dry_run
      raise ArgumentError, 'dry_run must be boolean' unless [true, false].include? @dry_run

      # Accounts inactive since this time will be considered for deletion
      @inactive_since = inactive_since || INACTIVITY_THRESHOLD.ago
      raise ArgumentError, 'inactive_since must be Time' unless @inactive_since.is_a? Time

      # Maximum number of accounts to delete per run.
      # This is a safety limit to prevent accidental deletion of too many accounts.
      @limit = limit || self.class::ACCOUNT_DELETION_LIMIT
      raise ArgumentError, 'limit must be Integer' unless @limit.is_a? Integer

      # Users that we don't want to include in paged batches.
      # Includes users who have already been processed or encountered an error.
      @processed_user_ids = []

      reset_metrics
    end

    def call
      reset_metrics

      log_message(
        "Starting #{self.class.name}#{dry_run? ? ' (dry-run)' : ''} for users inactive since #{inactive_since}, up to #{limit} accounts"
      )

      start_time = Time.now
      # Process individual batches in a loop to avoid issues with `find_each`,
      # which imposes an order by id, causing an inefficient scan on the id index.
      # Order does not matter for this operation, so we can use a simple limit approach.
      loop do
        inactive_user_batch = ActiveRecord::Base.connected_to(role: :reporting) {inactive_users.limit(batch_size)}

        inactive_user_batch.each do |user|
          break if num_accounts_deleted >= limit

          if dry_run?
            log_message("Dry run: would delete inactive user with (id=#{user.id})")
          else
            log_message("Deleting inactive user (id=#{user.id})")
            user.destroy!
          end

          self.num_accounts_deleted += 1
        rescue StandardError => exception
          self.num_errors += 1
          Honeybadger.notify(exception, context: {user_id: user.id})
          log_message("Error deleting user_id #{user.id}: #{exception.message}")
        ensure
          processed_user_ids << user.id
        end

        break if inactive_user_batch.size < batch_size || num_accounts_deleted >= limit
      end
      end_time = Time.now

      if dry_run?
        log_message("Dry run complete: would delete #{num_accounts_deleted} accounts. Encountered #{num_errors} errors.")
      else
        log_message format(
          "Deleted #{num_accounts_deleted} accounts in %.2f seconds. Encountered #{num_errors} errors.",
          end_time - start_time
        )
        upload_metrics
      end

      summary = "Deleted #{num_accounts_deleted} accounts"
      summary += "\nEncountered #{num_errors} errors" if num_errors.positive?
      summary += "\nDuration #{Time.at(end_time.to_i - start_time.to_i).utc.strftime("%H:%M:%S")}"
      summary += "\nDry run, no accounts actually deleted" if dry_run?

      log_to_slack(summary)
      log_to_slack(summary, channel: self.class::SLACK_CHANNEL_FOR_ERRORS) if num_errors.positive?

      summary
    end

    protected def user_scope
      raise NotImplementedError, "#{self.class} must implement #user_scope (the base scope for inactive user selection)"
    end

    private attr_reader :inactive_since, :limit
    private attr_writer :num_accounts_deleted, :num_errors, :start_time

    private def reset_metrics
      self.num_accounts_deleted = 0
      self.num_errors = 0
    end

    private def dry_run?
      @dry_run.present?
    end

    private def batch_size
      @batch_size ||= [self.class::BATCH_SIZE, limit].min
    end

    private def inactive_users
      Queries::User::Inactive.call(scope: user_scope, inactive_since:).where.not(id: processed_user_ids)
    end

    private def upload_metrics
      Metrics::Events.log_event(
        event_name: self.class::EVENT_NAME,
        metadata: {
          num_accounts_deleted: num_accounts_deleted,
          num_errors: num_errors,
        }
      )
    end

    private def log_message(message)
      CDO.log.info({event: message, namespace: self.class::LOGGING_NAMESPACE})
    end

    private def log_to_slack(message, options = {}, channel: self.class::SLACK_CHANNEL_FOR_SUMMARY)
      ChatClient.message(channel, prefixed(message), options)
    end

    private def prefixed(message)
      <<~MSG.chomp
        *#{self.class.name} Cronjob*#{dry_run? ? ' (dry-run)' : ''}
        <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/inactivity_cleanup|(source)>
        #{message}
      MSG
    end
  end
end
