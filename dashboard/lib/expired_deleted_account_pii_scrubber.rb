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
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :deleted_since, :limit
  attr_accessor :processed_user_ids
  alias :dry_run? :dry_run

  LOGGING_NAMESPACE = 'Platform/PiiScrubber'
  SLACK_CHANNEL_FOR_SUMMARY = 'cron-daily'
  SLACK_CHANNEL_FOR_ERRORS = 'user-accounts'
  ACCOUNT_SCRUB_LIMIT = 8_000
  BATCH_SIZE = 1_000

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

    reset_metrics
  end

  def call
    reset_metrics

    total_size = accounts_to_scrub.size
    if total_size > limit
      raise SafetyConstraintViolation, "Too many accounts to scrub: #{total_size} exceeds limit of #{limit}"
    end

    # Process individual batches in a loop to avoid issues with find_each, which imposes
    # an order by id, causing an inefficient scan on the id index. Order does not matter
    # for this operation, so we can use a simple limit approach.
    loop do
      account_batch = accounts_to_scrub.limit(BATCH_SIZE)
      account_batch.each do |user|
        scrub_user(user)
        self.num_accounts_scrubbed += 1
      rescue StandardError => exception
        self.num_errors += 1
        Honeybadger.notify(exception, context: {user_id: user.id})
        log_message("Error scrubbing user_id #{user.id}: #{exception.message}")
      ensure
        processed_user_ids << user.id
      end
      break if account_batch.size < BATCH_SIZE
    end

    if dry_run?
      log_message("Dry run complete: would scrub #{num_accounts_scrubbed} accounts. Encountered #{num_errors} errors.")
    else
      log_message(format("Scrubbed #{num_accounts_scrubbed} accounts in %.2f seconds. Encountered #{num_errors} errors.", (Time.now - start_time)))
      upload_metrics
    end

    log_to_slack(summary)
    log_to_slack(summary, SLACK_CHANNEL_FOR_ERRORS) if num_errors.positive?
  end

  def accounts_to_scrub
    Queries::User::ExpiredDeletedAccounts.call(deleted_before: deleted_since).where.not(id: processed_user_ids)
  end

  def summary
    summary = "Removed PII from #{num_accounts_scrubbed} accounts"
    summary += "\nEncountered #{num_errors} errors" if num_errors.positive?
    summary += "\nDuration #{Time.at(Time.now.to_i - start_time.to_i).utc.strftime("%H:%M:%S")}"
    summary += "\nDry run, no accounts actually scrubbed" if dry_run?
    summary
  end

  private attr_accessor :num_accounts_scrubbed, :num_errors, :start_time

  private def scrub_user(user)
    if dry_run?
      log_message("Dry run: would scrub PII from user_id #{user.id}")
    else
      log_message("Scrubbing PII from user_id #{user.id}")
      Services::User::PiiScrubber.call(user: user)
    end
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
          value: num_errors,
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

  private def reset_metrics
    self.num_accounts_scrubbed = 0
    self.num_errors = 0
    self.start_time = Time.now
  end
end
