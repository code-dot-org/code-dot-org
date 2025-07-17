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

  attr_reader :dry_run, :scrub_accounts_deleted_since, :max_accounts_to_scrub, :num_accounts_scrubbed, :num_errors, :start_time
  alias :dry_run? :dry_run

  LOGGING_NAMESPACE = 'Platform/PiiScrubber'

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # The amount of time after being soft-deleted that an account should be scrubbed of PII.
    @scrub_accounts_deleted_since = options[:scrub_accounts_deleted_since] || 28.days.ago
    raise ArgumentError.new('scrub_accounts_deleted_since must be Time') unless @scrub_accounts_deleted_since.is_a? Time

    # Maximum number of accounts to scrub in a single run.
    # This is a safety limit to prevent accidental deletion of too many accounts.
    @max_accounts_to_scrub = options[:max_accounts_to_scrub] || 8000
    raise ArgumentError.new('max_accounts_to_scrub must be Integer') unless @max_accounts_to_scrub.is_a? Integer

    reset_metrics
  end

  def scrub_pii_from_expired_deleted_accounts!
    reset_metrics

    accounts_to_scrub.in_batches(of: 1000).each do |batch|
      batch.each do |user|
        scrub_user(user)
        @num_accounts_scrubbed += 1
      rescue Exception => exception
        Honeybadger.notify(exception, context: {user_id: user.id})
        log_message("Error scrubbing user_id #{user.id}: #{exception.message}")
      end
    end

    if dry_run?
      log_message("Dry run complete: would scrub #{@num_accounts_scrubbed} accounts. Encountered #{@num_errors} errors.")
    else
      log_message("Scrubbed #{@num_accounts_scrubbed} accounts in #{Time.now - @start_time} seconds. Encountered #{@num_errors} errors.")
      upload_metrics
    end

    log_to_slack(summary)
    log_to_slack(summary, 'user-accounts') if @num_errors
  end

  def accounts_to_scrub
    accounts = Queries::User::ExpiredDeletedAccounts.call(deleted_before: @scrub_accounts_deleted_since)
    if accounts.count > @max_accounts_to_scrub
      raise SafetyConstraintViolation, "Too many accounts to scrub: #{accounts.count} exceeds limit of #{@max_accounts_to_scrub}"
    end
    accounts
  end

  def summary
    summary = "Removed PII from #{@num_accounts_scrubbed} accounts"
    summary += "\nEncountered #{@num_errors} errors" if @num_errors.positive?
    summary += "\nDuration #{Time.at(Time.now.to_i - @start_time.to_i).utc.strftime("%H:%M:%S")}"
    summary += "\nDry run, no accounts actually scrubbed" if dry_run?
    summary
  end

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
          value: @num_accounts_scrubbed,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
          ]
        },
        {
          metric_name: 'NumErrors',
          value: @num_errors,
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

  private def log_to_slack(message, channel = 'cron-daily', options = {})
    ChatClient.message(channel, prefixed(message), options)
  end

  private def prefixed(message)
    "*PII Scrub Cronjob*#{dry_run? ? ' (dry-run)' : ''} " \
    "<https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/expired_deleted_account_pii_scrubber.rb|(source)>" \
    "\n#{message}"
  end

  private def reset_metrics
    @num_accounts_scrubbed = 0
    @num_errors = 0
    @start_time = Time.now
  end
end
