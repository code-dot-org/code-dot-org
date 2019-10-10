require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'

#
# Locates accounts that were soft-deleted more than <n> days ago and
# performs a hard-delete on those accounts, permanently removing the account
# data from our system.  Adds accounts to manual review queue if an automatic
# delete encounters problems or exceeds some safety limit.
#
# Sends metrics to Cloudwatch:
# - Number of soft-deleted accounts in system
# - Number of accounts purged
# - Number of accounts queued for manual review
# - Depth of manual review queue
#
# Logs activity to Slack #cron-daily room.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/1l2kB4COz8-NwZfNCGufj7RfdSm-B3waBmLenc6msWVs/edit
#
class ExpiredDeletedAccountPurger
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :deleted_after, :deleted_before, :max_teachers_to_purge,
    :max_accounts_to_purge, :log
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

    # Do nothing if more than this number of teachers would be purged.
    # We can keep a much tighter control on this because teacher deletes are much more stable than
    # student deletes, which may spike dramatically due to cascading delete rules.
    # We expect this to stay below 100 during September 2018.
    @max_teachers_to_purge = options[:max_teachers_to_purge] || 200
    raise ArgumentError.new('max_teachers_to_purge must be Integer') unless @max_teachers_to_purge.is_a? Integer

    # Do nothing if more than this number of accounts would be purged in total.
    # We may need to adjust this over time as activity increases on our site.
    # This is a loose constraint because cascading student deletes make this a very spiky metric.
    # 4000 is ~0.01% of our user rows.
    # We expect this to stay below 1500 during September 2018.
    @max_accounts_to_purge = options[:max_accounts_to_purge] || 4000
    raise ArgumentError.new('max_accounts_to_purge must be Integer') unless @max_accounts_to_purge.is_a? Integer

    reset
  end

  def purge_expired_deleted_accounts!
    reset
    check_constraints

    account_purger = AccountPurger.new dry_run: @dry_run, log: @log
    expired_soft_deleted_accounts.each do |account|
      account_purger.purge_data_for_account account
      @num_accounts_purged += 1
    rescue StandardError => err
      QueuedAccountPurge.create(user: account, reason_for_review: err.message) unless @dry_run
      @num_accounts_queued += 1
    end
  rescue StandardError => err
    yell err.message
    raise
  ensure
    report_results
  end

  private

  def reset
    # Logging stream we can pass down to the account purger component so it
    # can add its own content to the log
    @log = StringIO.new

    # Other values tracked internally and reset with every run
    @num_accounts_purged = 0
    @num_accounts_queued = 0
    @start_time = Time.now

    start_activity_log
  end

  def start_activity_log
    @log.puts "Starting purge_expired_deleted_accounts!"
    @log.puts "deleted_after: #{@deleted_after}"
    @log.puts "deleted_before: #{@deleted_before}"
    @log.puts "max_teachers_to_purge: #{@max_teachers_to_purge}"
    @log.puts "max_accounts_to_purge: #{@max_accounts_to_purge}"
    @log.puts "(dry-run)" if @dry_run
  end

  def check_constraints
    if expired_soft_deleted_accounts.select(&:teacher?).count > @max_teachers_to_purge
      raise SafetyConstraintViolation, "Found #{expired_soft_deleted_accounts.count} " \
        "teachers to purge, which exceeds the configured limit of " \
        "#{@max_teachers_to_purge}. Abandoning run."
    end

    if expired_soft_deleted_accounts.count > @max_accounts_to_purge
      raise SafetyConstraintViolation, "Found #{expired_soft_deleted_accounts.count} " \
        "accounts to purge, which exceeds the configured limit of " \
        "#{@max_accounts_to_purge}. Abandoning run."
    end
  end

  def expired_soft_deleted_accounts
    user_ids_needing_manual_review = QueuedAccountPurge.needing_manual_review.pluck(:user_id)
    soft_deleted_accounts.
      where(
        'deleted_at BETWEEN :start_date AND :end_date',
        start_date: @deleted_after,
        end_date: @deleted_before
      ).
      where.not(id: user_ids_needing_manual_review)
  end

  def soft_deleted_accounts
    User.with_deleted.where(purged_at: nil).where.not(deleted_at: nil)
  end

  def report_results
    review_queue_depth = manual_review_queue_depth

    metrics = build_metrics review_queue_depth
    log_metrics metrics

    summary = build_summary review_queue_depth
    @log.puts summary

    log_link = upload_activity_log
    say "#{summary} #{log_link}" if rack_env? :production

    upload_metrics metrics unless @dry_run
  end

  def manual_review_queue_depth
    QueuedAccountPurge.count
  end

  def build_metrics(review_queue_depth)
    {
      # Number of accounts purged during this run
      AccountsPurged: @num_accounts_purged,
      # Number of accounts queued for manual review during this run
      AccountsQueued: @num_accounts_queued,
      # Depth of manual review queue after this run
      ManualReviewQueueDepth: review_queue_depth,
    }
  end

  def metric_name(name)
    "Custom/DeletedAccountPurger/#{name}"
  end

  def log_metrics(metrics)
    metrics.each do |key, value|
      @log.puts "#{key}: #{value}"
    end
  end

  def upload_metrics(metrics)
    aws_metrics = metrics.map do |key, value|
      {
        metric_name: key,
        dimensions: [
          {name: "Environment", value: CDO.rack_env},
        ],
        value: value
      }
    end
    Cdo::Metrics.push('DeletedAccountPurger', aws_metrics)
  end

  def build_summary(review_queue_depth)
    formatted_duration = Time.at(Time.now.to_i - @start_time.to_i).utc.strftime("%H:%M:%S")

    summary = purged_accounts_summary
    summary += "\n" + queued_accounts_summary if @num_accounts_queued > 0
    summary += "\n#{review_queue_depth} account(s) require review." if review_queue_depth > 0
    summary + "\n🕐 #{formatted_duration}"
  end

  def purged_accounts_summary
    intro = @dry_run ? 'Would have purged' : 'Purged'
    "#{intro} #{@num_accounts_purged} account(s)."
  end

  def queued_accounts_summary
    intro = @dry_run ? 'Would have queued' : 'Queued'
    "#{intro} #{@num_accounts_queued} account(s) for manual review."
  end

  # @return [String] HTML link to view uploaded log
  def upload_activity_log
    log_url = AWS::S3::LogUploader.
      new('cdo-audit-logs', "expired-deleted-account-purger-activity/#{CDO.rack_env}").
      upload_log(@start_time.strftime('%Y%m%dT%H%M%S%z'), @log.string)
    " <a href='#{log_url}'>☁ Log on S3</a>"
  end

  # Send error messages to #cron-daily
  def yell(message)
    @log.puts message
    say message, color: 'red', notify: 1
  end

  # Send messages to Slack #cron-daily
  def say(message, options = {})
    ChatClient.message 'cron-daily', prefixed(message), options
  end

  def prefixed(message)
    "ExpiredDeletedAccountPurger#{@dry_run ? ' (dry-run)' : ''}: #{message}"
  end
end
