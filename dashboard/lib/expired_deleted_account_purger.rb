require 'stringio'
require 'cdo/aws/s3'
require 'cdo/chat_client'

#
# Locates accounts that were soft-deleted more than <n> days ago and
# performs a hard-delete on those accounts, permanently removing the account
# data from our system.  Adds accounts to manual review queue if an automatic
# delete encounters problems or exceeds some safety limit.
#
# Sends metrics to New Relic:
# - Number of soft-deleted accounts in system
# - Number of accounts purged
# - Depth of manual review queue
#
# Logs activity to Slack #cron-daily room.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/1l2kB4COz8-NwZfNCGufj7RfdSm-B3waBmLenc6msWVs/edit
#
class ExpiredDeletedAccountPurger
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :deleted_after, :deleted_before, :max_accounts_to_purge,
    :log
  alias :dry_run? :dry_run

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # Only purge accounts soft-deleted after this date.
    # The default is when we released the updated messaging about hard-deletes.
    @deleted_after = options[:deleted_after] || Time.parse('2018-07-31 4:18pm PDT')
    raise ArgumentError.new('deleted_after must be Time') unless @deleted_after.is_a? Time

    # Only purge accounts soft-deleted this long ago.
    # Default is based on our agreement with at least one district.
    @deleted_before = options[:deleted_before] || 28.days.ago
    raise ArgumentError.new('deleted_before must be Time') unless @deleted_before.is_a? Time

    # Do nothing if more than this number of accounts would be purged.
    # We'll want to adjust this over time to match activity on our site.
    @max_accounts_to_purge = options[:max_accounts_to_purge] || 100
    raise ArgumentError.new('max_accounts_to_purge must be Integer') unless @max_accounts_to_purge.is_a? Integer

    @log = StringIO.new
  end

  def purge_expired_deleted_accounts!
    start_time = Time.now
    start_activity_log
    num_accounts_purged = 0
    check_constraints

    account_purger = AccountPurger.new dry_run: @dry_run, log: @log
    expired_soft_deleted_accounts.each do |account|
      account_purger.purge_data_for_account account
      num_accounts_purged += 1
    rescue StandardError => err
      QueuedAccountPurge.create user: account, reason_for_review: err.message
    end

    if @dry_run
      say "Would have purged #{num_accounts_purged} accounts"
    else
      say "Purged #{num_accounts_purged} accounts"
    end
    say "#{manual_review_queue_depth} accounts require review" if manual_review_queue_depth > 0
  rescue StandardError => err
    yell err.message
    raise
  ensure
    metrics = gather_metrics num_accounts_purged
    upload_activity_log start_time, metrics
    send_metrics metrics unless @dry_run
  end

  private def start_activity_log
    @log.puts "Starting purge_expired_deleted_accounts!"
    @log.puts "deleted_after: #{@deleted_after}"
    @log.puts "deleted_before: #{@deleted_before}"
    @log.puts "max_accounts_to_purge: #{@max_accounts_to_purge}"
    @log.puts "(dry-run)" if @dry_run
  end

  private def upload_activity_log(time, metrics)
    metrics.each do |key, value|
      @log.puts "#{key}: #{value}"
    end
    @log.puts "Done in #{Time.now - time} seconds"
    AWS::S3::LogUploader.
      new('cdo-audit-logs', "expired-deleted-account-purger-activity/#{CDO.rack_env}").
      upload_log(time.strftime('%Y%m%dT%H%M%S%z'), @log.string)
  end

  private def check_constraints
    if expired_soft_deleted_accounts.count > @max_accounts_to_purge
      raise SafetyConstraintViolation, "Found #{expired_soft_deleted_accounts.count} " \
        "accounts to purge, which exceeds the configured limit of " \
        "#{@max_accounts_to_purge}. Abandoning run."
    end
  end

  private def gather_metrics(num_accounts_purged)
    {
      # Number of soft-deleted accounts in system after this run
      "Custom/DeletedAccountPurger/SoftDeletedAccounts" => soft_deleted_accounts.count,
      # Number of accounts purged during this run
      "Custom/DeletedAccountPurger/AccountsPurged" => num_accounts_purged,
      # Depth of manual review queue after this run
      "Custom/DeletedAccountPurger/ManualReviewQueueDepth" => manual_review_queue_depth,
    }
  end

  private def send_metrics(metrics)
    metrics.each do |key, value|
      NewRelic::Agent.record_metric key, value
    end
  end

  private def soft_deleted_accounts
    User.with_deleted.where(purged_at: nil).where.not(deleted_at: nil)
  end

  private def expired_soft_deleted_accounts
    user_ids_needing_manual_review = QueuedAccountPurge.pluck(:user_id)
    soft_deleted_accounts.
      where(
        'deleted_at BETWEEN :start_date AND :end_date',
        start_date: @deleted_after,
        end_date: @deleted_before
      ).
      where.not(id: user_ids_needing_manual_review)
  end

  private def manual_review_queue_depth
    QueuedAccountPurge.all.count
  end

  # Send messages to Slack #cron-daily room.
  private def say(message, options = {})
    @log.puts message
    ChatClient.message 'cron-daily', prefixed(message), options
  end

  # Send error messages to #cron-daily and #server-operations
  private def yell(message)
    say message, color: 'red', notify: 1
  end

  private def prefixed(message)
    "ExpiredDeletedAccountPurger#{@dry_run ? ' (dry-run)' : ''}: #{message}"
  end
end
