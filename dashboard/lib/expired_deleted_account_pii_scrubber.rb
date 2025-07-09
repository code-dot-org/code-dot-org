require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'
require 'queries/child_account'

# Queries for accounts soft-deleted at least 28 days ago and scrube them
# of PII (personally identifiable information).
#
# This renders the accounts unrecoverable but retains as much useful non-PII
# data as possible.
#
# Logs activity to Cloudwatch and Slack #cron-daily room.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/15hkknuRlvGFbPuwlZssliMQTmykxM8_ajXB4yDOSPCA/edit
# @see Account Purger Cloudwatch dashboard
# TODO - Add link to the dashboard
#
class ExpiredDeletedAccountPiiScrubber
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :scrub_accounts_deleted_since, :max_accounts_to_scrub, :log
  alias :dry_run? :dry_run

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # The amount of time after being soft-deleted that an account should be scrubbed of PII.
    @scrub_accounts_deleted_since = options[:scrub_accounts_deleted_since] || 28.days.ago
    raise ArgumentError.new('scrub_accounts_deleted_since must be Time') unless @scrub_accounts_deleted_since.is_a? Time

    # Maximum number of accounts to scrub in a single run.
    # This is a safety limit to prevent accidental deletion of too many accounts.
    @max_accounts_to_scrub = options[:max_accounts_to_scrub] || 200
    raise ArgumentError.new('max_accounts_to_scrub must be Integer') unless @max_accounts_to_scrub.is_a? Integer

    reset
  end

  private def reset
    # Logging stream we can pass down to the account purger component so it
    # can add its own content to the log
    @log = StringIO.new

    # Other values tracked internally and reset with every run
    @num_accounts_purged = 0
    @num_accounts_queued = 0
    @purge_size_limit_exceeded = 0
    @start_time = Time.now

    start_activity_log
  end
end
