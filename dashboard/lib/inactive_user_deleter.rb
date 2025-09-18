# frozen_string_literal: true

require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'
require 'cdo/honeybadger'

# Queries for accounts that have been Inactive for more than
# 3.5 years and soft-deletes them.
#
# Logs activity to the user-accounts and cron-daily Slack channels, as well as Cloudwatch.
class InactiveUserDeleter
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :inactive_since, :limit
  attr_accessor :processed_user_ids
  alias :dry_run? :dry_run

  LOGGING_NAMESPACE = 'Platform/InactiveUserDeleter'
  EVENT_NAME = 'inactive_user_deleter'
  SLACK_CHANNEL_FOR_SUMMARY = 'cron-daily'
  SLACK_CHANNEL_FOR_ERRORS = 'user-accounts'
  ACCOUNT_DELETION_LIMIT = 8_000
  BATCH_SIZE = 1_000
  INACTIVE_USER_TTL = 42.months

  # @param dry_run [Boolean] If true, no accounts will actually be deleted.
  # @param inactive_since [Time] The time before which accounts are considered inactive
  #   Defaults to 3.5 years ago, which is the current period before accounts are rendered inactive
  # @param limit [Integer] The maximum number of accounts to delete in a single run.
  #   This is a safety limit to prevent accidental deletion of too many accounts.
  def initialize(dry_run: false, inactive_since: nil, limit: ACCOUNT_DELETION_LIMIT)
    @dry_run = dry_run.nil? ? false : dry_run
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # Accounts inactive since this time will be considered for deletion
    @inactive_since = inactive_since || INACTIVE_USER_TTL.ago
    raise ArgumentError.new('inactive_since must be Time') unless @inactive_since.is_a? Time

    # Maximum number of accounts to delete in a single run.
    # This is a safety limit to prevent accidental deletion of too many accounts.
    @limit = limit || ACCOUNT_DELETION_LIMIT
    raise ArgumentError.new('limit must be Integer') unless @limit.is_a? Integer

    # Users that we don't want to include in paged batches. Includes users who have already been processed or encountered an error.
    @processed_user_ids = []

    reset_metrics
  end

  def call
    reset_metrics

    total_size = inactive_users.size
    if total_size > limit
      raise SafetyConstraintViolation, "Too many accounts to delete: #{total_size} exceeds limit of #{limit}"
    end

    # Process individual batches in a loop to avoid issues with find_each, which imposes
    # an order by id, causing an inefficient scan on the id index. Order does not matter
    # for this operation, so we can use a simple limit approach.
    loop do
      account_batch = inactive_users.limit(BATCH_SIZE)
      account_batch.each do |user|
        delete_user(user)
        self.num_accounts_deleted += 1
      rescue StandardError => exception
        self.num_errors += 1
        Honeybadger.notify(exception, context: {user_id: user.id})
        log_message("Error deleting user_id #{user.id}: #{exception.message}")
      ensure
        processed_user_ids << user.id
      end
      break if account_batch.size < BATCH_SIZE
    end

    if dry_run?
      log_message("Dry run complete: would delete #{num_accounts_deleted} accounts. Encountered #{num_errors} errors.")
    else
      log_message(format("Deleted #{num_accounts_deleted} accounts in %.2f seconds. Encountered #{num_errors} errors.", (Time.now - start_time)))
      upload_metrics
    end

    log_to_slack(summary)
    log_to_slack(summary, SLACK_CHANNEL_FOR_ERRORS) if num_errors.positive?
  end

  def inactive_users
    ActiveRecord::Base.connected_to(role: :reporting) do
      Queries::User::Inactive.call(inactive_since: inactive_since).where.not(id: processed_user_ids)
    end
  end

  def summary
    summary = "Deleted #{num_accounts_deleted} accounts"
    summary += "\nEncountered #{num_errors} errors" if num_errors.positive?
    summary += "\nDuration #{Time.at(Time.now.to_i - start_time.to_i).utc.strftime("%H:%M:%S")}"
    summary += "\nDry run, no accounts actually deleted" if dry_run?
    summary
  end

  private attr_accessor :num_accounts_deleted, :num_errors, :start_time

  private def delete_user(user)
    if dry_run?
      log_message("Dry run: would delete inactive user with (id=#{user.id})")
    else
      log_message("Deleting inactive user (id=#{user.id})")
      user.destroy!
    end
  end

  private def upload_metrics
    Metrics::Events.log_event(
      event_name: EVENT_NAME,
      metadata: {
        num_accounts_deleted: num_accounts_deleted,
        num_errors: num_errors,
      }
    )
  end

  private def log_message(message)
    CDO.log.info({event: message, namespace: LOGGING_NAMESPACE})
  end

  private def log_to_slack(message, channel = SLACK_CHANNEL_FOR_SUMMARY, options = {})
    ChatClient.message(channel, prefixed(message), options)
  end

  private def prefixed(message)
    "*Inactive User Deleter Cronjob*#{dry_run? ? ' (dry-run)' : ''} " \
    "<https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/inactive_user_deleter.rb|(source)>" \
    "\n#{message}"
  end

  private def reset_metrics
    self.num_accounts_deleted = 0
    self.num_errors = 0
    self.start_time = Time.now
  end
end
