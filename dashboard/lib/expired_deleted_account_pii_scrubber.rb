# frozen_string_literal: true

require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'
require 'cdo/honeybadger'

# Queries for accounts soft-deleted at least 28 days ago and scrub them
# of PII (personally identifiable information).
#
# This renders the accounts unrecoverable but retains as much useful non-PII
# data as possible.
#
# Logs activity to the user-accounts and cron-daily Slack channels, as well as Cloudwatch.
class ExpiredDeletedAccountPiiScrubber
  LOGGING_NAMESPACE = 'Platform/PiiScrubber'
  SLACK_CHANNEL_FOR_SUMMARY = 'cron-daily'
  SLACK_CHANNEL_FOR_ERRORS = 'user-accounts'
  ACCOUNT_SCRUB_LIMIT = 8_000
  BATCH_SIZE = 1_000

  attr_reader :processed_user_ids, :user_errors

  # @param dry_run [Boolean] If true, no accounts will actually be scrubbed.
  # @param deleted_since [Time] The time before which accounts should be scrubbed of PII.
  #   Defaults to 28 days ago, which is the current grace period before rendering accounts
  #   unrecoverable during the PII purge process.
  # @param limit [Integer] The maximum number of accounts to scrub in a single run.
  #   This is a safety limit to prevent accidental deletion of too many accounts.
  def initialize(dry_run: false, deleted_since: nil, limit: ACCOUNT_SCRUB_LIMIT)
    @dry_run = dry_run.nil? ? false : dry_run
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # The amount of time after being soft-deleted that an account should be scrubbed of PII.
    @deleted_since = deleted_since || ::User::SOFT_DELETED_RECORD_TTL.ago
    raise ArgumentError.new('deleted_since must be Time') unless @deleted_since.is_a? Time

    # Maximum number of accounts to scrub in a single run.
    # This is a safety limit to prevent accidental deletion of too many accounts.
    @limit = limit || ACCOUNT_SCRUB_LIMIT
    raise ArgumentError.new('limit must be Integer') unless @limit.is_a? Integer

    # Users that we don't want to include in paged batches. Includes users who have already been processed or encountered an error.
    @processed_user_ids = []
    @user_errors = {}
  end

  def call
    start_time = Time.now
    # Process individual batches in a loop to avoid issues with find_each, which imposes
    # an order by id, causing an inefficient scan on the id index. Order does not matter
    # for this operation, so we can use a simple limit approach.
    while remaining_limit.positive?
      # Cap the batch size to avoid scrubbing more users than the remaining limit.
      batch_size = [BATCH_SIZE, remaining_limit].min

      # Execute batch selection on the reporting replica and materialize results.
      account_batch = ActiveRecord::Base.connected_to(role: :reporting) do
        accounts_to_scrub.limit(batch_size).to_a
      end

      account_batch.each do |user|
        if dry_run?
          log_message("Dry run: would scrub PII from user_id #{user.id}")
        else
          log_message("Scrubbing PII from user_id #{user.id}")
          ActiveRecord::Base.connected_to(role: :writing) do
            Services::User::PiiScrubber.call(user:)
          end
        end
      rescue StandardError => exception
        user_errors[user.id] = exception.message
        log_message("Error scrubbing user_id #{user.id}: #{exception.message}")
      ensure
        processed_user_ids << user.id
      end

      break if account_batch.size < batch_size
    end
    end_time = Time.now

    if dry_run?
      log_message("Dry run complete: would scrub #{num_accounts_scrubbed} accounts. Encountered #{user_errors.size} errors.")
    else
      log_message(format("Scrubbed #{num_accounts_scrubbed} accounts in %.2f seconds. Encountered #{user_errors.size} errors.", (end_time - start_time)))
      upload_metrics
    end

    summary = "Removed PII from #{num_accounts_scrubbed} accounts"
    summary += "\nEncountered #{user_errors.size} errors" if user_errors.present?
    summary += "\nDuration #{Time.at(end_time.to_i - start_time.to_i).utc.strftime('%H:%M:%S')}"
    summary += "\nDry run, no accounts actually scrubbed" if dry_run?

    log_to_slack(summary)

    if user_errors.present?
      log_to_slack(summary, SLACK_CHANNEL_FOR_ERRORS)
      Honeybadger.notify('Failed to scrub PII for users', context: {num_accounts_scrubbed:, user_errors:})
    end

    summary
  end

  def accounts_to_scrub
    Queries::User::ExpiredDeletedAccounts.call(deleted_before: deleted_since).where.not(id: processed_user_ids)
  end

  def num_accounts_scrubbed
    processed_user_ids.size - user_errors.size
  end

  private attr_reader :deleted_since, :limit
  private attr_writer :user_errors

  private def dry_run? = @dry_run

  private def remaining_limit
    limit - num_accounts_scrubbed
  end

  private def upload_metrics
    Cdo::Metrics.push('PiiScrubber',
      [
        {
          metric_name: 'NumAccountsScrubbed',
          value: num_accounts_scrubbed,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
          ]
        },
        {
          metric_name: 'NumErrors',
          value: user_errors.size,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
          ]
        }
      ]
    )
  end

  private def log_message(message)
    CDO.log.info({event: message, namespace: LOGGING_NAMESPACE})
  end

  private def log_to_slack(message, channel = SLACK_CHANNEL_FOR_SUMMARY, options = {})
    ChatClient.message(channel, prefixed(message), options)
  end

  private def prefixed(message)
    "*PII Scrub Cronjob*#{dry_run? ? ' (dry-run)' : ''} " \
    "<https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/expired_deleted_account_pii_scrubber.rb|(source)>" \
    "\n#{message}"
  end
end
