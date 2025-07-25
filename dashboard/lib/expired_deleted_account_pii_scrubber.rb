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

  attr_reader :dry_run, :scrub_accounts_deleted_since, :max_accounts_to_scrub
  alias :dry_run? :dry_run

  LOGGING_NAMESPACE = 'Platform/PiiScrubber'
  SLACK_CHANNEL_FOR_SUMMARY = 'cron-daily'
  SLACK_CHANNEL_FOR_ERRORS = 'user-accounts'
  ACCOUNT_SCRUB_LIMIT = 8_000

  # @param dry_run [Boolean] If true, no accounts will actually be scrubbed.
  # @param scrub_accounts_deleted_since [Time] The time before which accounts should be scrubbed of PII.
  #   Defaults to 28 days ago, which is the current grace period before rendering accounts
  #   unrecoverable during the PII purge process.
  # @param max_accounts_to_scrub [Integer] The maximum number of accounts to scrub in a single run.
  #   This is a safety limit to prevent accidental deletion of too many accounts.
  def initialize(dry_run: false, scrub_accounts_deleted_since: nil, max_accounts_to_scrub: ACCOUNT_SCRUB_LIMIT)
    @dry_run = dry_run.nil? ? false : dry_run
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # The amount of time after being soft-deleted that an account should be scrubbed of PII.
    @scrub_accounts_deleted_since = scrub_accounts_deleted_since || ::User::SOFT_DELETED_RECORD_TTL.ago
    raise ArgumentError.new('scrub_accounts_deleted_since must be Time') unless @scrub_accounts_deleted_since.is_a? Time

    # Maximum number of accounts to scrub in a single run.
    # This is a safety limit to prevent accidental deletion of too many accounts.
    @max_accounts_to_scrub = max_accounts_to_scrub || ACCOUNT_SCRUB_LIMIT
    raise ArgumentError.new('max_accounts_to_scrub must be Integer') unless @max_accounts_to_scrub.is_a? Integer

    reset_metrics
  end

  def call
    reset_metrics

    accounts_to_scrub.find_each do |user|
      scrub_user(user)
      self.num_accounts_scrubbed += 1
    rescue StandardError => exception
      self.num_errors += 1
      Honeybadger.notify(exception, context: {user_id: user.id})
      log_message("Error scrubbing user_id #{user.id}: #{exception.message}")
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
    accounts = Queries::User::ExpiredDeletedAccounts.call(deleted_before: scrub_accounts_deleted_since)
    total_accounts = accounts.count
    if total_accounts > max_accounts_to_scrub
      raise SafetyConstraintViolation, "Too many accounts to scrub: #{total_accounts} exceeds limit of #{max_accounts_to_scrub}"
    end
    accounts
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
