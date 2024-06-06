require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'
require 'queries/child_account'

# Scans for child accounts which should be hard-deleted because Code.org hasn't
# received permission from their parents to create the account.
#
# Look at the `build_metrics` method to see which metrics are sent to
# CloudWatch.
#
# Logs activity to Slack #cron-daily room.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/15hkknuRlvGFbPuwlZssliMQTmykxM8_ajXB4yDOSPCA/edit
# @see Account Purger Cloudwatch dashboard
# TODO - Add link to the dashboard
#
class ExpiredChildAccountPurger
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :lock_out_date, :max_accounts_to_purge, :log
  alias :dry_run? :dry_run

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # The amount of time an account is allowed to be locked out before it is
    # purged.
    # The default is 7 days.
    @lock_out_date = options[:lock_out_date] || 7.days.ago
    raise ArgumentError.new('lock_out_date must be Time') unless @lock_out_date.is_a? Time

    # Do nothing if more than this number of accounts would be purged in total.
    # The motivation of this limit is to protect ourselves from bugs where we
    # accidentally delete a large number of accounts we shouldn't be deleting.
    # We may need to adjust this over time as activity increases on our site.
    # Default to 200
    @max_accounts_to_purge = options[:max_accounts_to_purge] || 200
    raise ArgumentError.new('max_accounts_to_purge must be Integer') unless @max_accounts_to_purge.is_a? Integer

    reset
  end

  def purge_expired_child_accounts!(skip_report: false)
    reset
    # Query for how many accounts would be purged
    # Fail if the count is too high.
    accounts = Queries::ChildAccount.expired_accounts
    @num_accounts_to_be_purged = accounts.size
    check_constraints accounts

    account_purger = AccountPurger.new dry_run: @dry_run, log: @log
    accounts.find_each do |account|
      account_purger.purge_data_for_account account
      Services::ChildAccount::EventLogger.log_account_purging(account)
      @num_accounts_purged += 1
    rescue StandardError => exception
      # If we failed to purge the account, add it to our manual review queue.
      QueuedAccountPurge.create(user: account, reason_for_review: exception.message) unless @dry_run
      @num_accounts_queued += 1
    end

    QueuedAccountPurge.clean_up_resolved_records!
  rescue StandardError => exception
    yell exception.message
    raise
  ensure
    report_results unless skip_report
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

  private def start_activity_log
    @log.puts "Starting purge_expired_child_accounts!"
    @log.puts "(dry-run)" if @dry_run
  end

  private def check_constraints(accounts)
    if accounts.count > @max_accounts_to_purge
      @purge_size_limit_exceeded = 1
      raise SafetyConstraintViolation, "Found #{accounts.count} " \
        "accounts to purge, which exceeds the configured limit of " \
        "#{@max_accounts_to_purge}. Abandoning run."
    end
  end

  private def report_results
    review_queue_depth = QueuedAccountPurge.count
    manual_reviews_needed = QueuedAccountPurge.needing_manual_review.count
    metrics = build_metrics review_queue_depth, manual_reviews_needed
    log_metrics metrics

    summary = build_summary review_queue_depth, manual_reviews_needed
    @log.puts summary

    log_link = upload_activity_log
    if rack_env? :production
      if manual_reviews_needed > 0
        warn "#{summary} #{log_link}"
      else
        say "#{summary} #{log_link}"
      end
    elsif rack_env? :development
      puts "#{summary} #{log_link}"
    end

    upload_metrics metrics unless @dry_run
  end

  private def build_metrics(review_queue_depth, manual_reviews_needed)
    {
      # 0 or 1 if the size of the purge would exceed the limit
      PurgeSizeLimitExceeded: @purge_size_limit_exceeded,
      # Number of accounts purged during this run
      AccountsPurged: @num_accounts_purged,
      # Number of accounts queued for manual review during this run
      AccountsQueued: @num_accounts_queued,
      # Depth of review queue after this run (may include auto-retryable entries)
      ReviewQueueDepth: review_queue_depth,
      # Total number of accounts needs manual review (including accounts from previous runs)
      ManualReviewQueueDepth: manual_reviews_needed
    }
  end

  private def metric_name(name)
    "Custom/ExpiredChildAccountPurger/#{name}"
  end

  private def log_metrics(metrics)
    metrics.each do |key, value|
      @log.puts "#{key}: #{value}"
    end
  end

  private def upload_metrics(metrics)
    aws_metrics = metrics.map do |key, value|
      {
        metric_name: key,
        dimensions: [
          {name: "Environment", value: CDO.rack_env},
        ],
        value: value
      }
    end
    Cdo::Metrics.push('ExpiredChildAccountPurger', aws_metrics)
  end

  private def build_summary(review_queue_depth, manual_reviews_needed)
    formatted_duration = Time.at(Time.now.to_i - @start_time.to_i).utc.strftime("%H:%M:%S")

    summary = expired_accounts_summary
    summary += "\n" + purged_accounts_summary
    summary + "\n🕐 #{formatted_duration}"
  end

  private def purged_accounts_summary
    intro = @dry_run ? 'Would have purged' : 'Purged'
    "#{intro} #{@num_accounts_purged} child account(s)."
  end

  private def expired_accounts_summary
    "#{@num_accounts_to_be_purged} child account(s) have expired."
  end

  # @return [String] HTML link to view uploaded log
  private def upload_activity_log
    log_url = AWS::S3::LogUploader.
      new('cdo-audit-logs', "expired-child-account-purger-activity/#{CDO.rack_env}").
      upload_log(@start_time.strftime('%Y%m%dT%H%M%S%z'), @log.string)
    " <a href='#{log_url}'>☁ Log on S3</a>"
  end

  # Send error messages to #cron-daily and #user-accounts
  private def yell(message)
    @log.puts message
    say message, 'cron-daily', color: 'red', notify: 1
    say message, 'user-accounts', color: 'red', notify: 1
  end

  # Send warning messages to #cron-daily and #user-accounts
  private def warn(message)
    say message, 'cron-daily', color: 'yellow'
    say message, 'user-accounts', color: 'yellow'
  end

  # Send messages to Slack #cron-daily
  private def say(message, channel = 'cron-daily', options = {})
    ChatClient.message channel, prefixed(message), options
  end

  private def prefixed(message)
    "*ExpiredChildAccountPurger* #{@dry_run ? '(dry-run)' : ''}" \
    "<https://github.com/code-dot-org/code-dot-org/blob/production/dashboard/lib/expired_child_account_purger.rb|(source)>" \
    "\n#{message}"
  end
end
