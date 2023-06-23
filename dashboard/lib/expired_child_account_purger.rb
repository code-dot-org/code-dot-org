require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'

#
# Scans for child accounts which should be hard-deleted because Code.org hasn't
# received permission from their parents to create the account.
# o
# Sends metrics to Cloudwatch:
# - Number of accounts purged
# - max_accounts_to_purge limit exceeded
# Logs activity to Slack #cron-daily room.
#
# @see Technical Spec: Hard-deleting accounts
# https://docs.google.com/document/d/15hkknuRlvGFbPuwlZssliMQTmykxM8_ajXB4yDOSPCA/edit
# @see Account Purger Cloudwatch dashboard
# TODO - Add link to the dashboard
#
class ExpiredChildAccountPurger
  class SafetyConstraintViolation < RuntimeError; end

  attr_reader :dry_run, :deleted_after, :max_accounts_to_purge, :log
  alias :dry_run? :dry_run

  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    # Only purge accounts soft-deleted after this date.
    # The default is 7 days ago.
    @deleted_after = options[:deleted_after] || 7.days.ago
    raise ArgumentError.new('deleted_after must be Time') unless @deleted_after.is_a? Time

    # Do nothing if more than this number of accounts would be purged in total.
    # The motivation of this limit is to protect ourselves from bugs where we
    # accidentally delete a large number of accounts we shouldn't be deleting.
    # We may need to adjust this over time as activity increases on our site.
    # Default to 1000
    @max_accounts_to_purge = options[:max_accounts_to_purge] || 1000
    raise ArgumentError.new('max_accounts_to_purge must be Integer') unless @max_accounts_to_purge.is_a? Integer

    reset
  end

  def purge_expired_child_accounts!
    # Query for how many accounts would be purged
    # Fail if the count is too high.
    reset
    accounts = expired_child_accounts
    @num_accounts_to_be_purged = expired_child_accounts.size
    check_constraints accounts

    account_purger = AccountPurger.new dry_run: @dry_run, log: @log
    accounts.each do |account|
      account_purger.purge_data_for_account account
      @num_accounts_purged += 1
    end

    #TODO DAYNE if an account fails to be purged, add it to the purger queue.
    QueuedAccountPurge.clean_up_resolved_records!
  rescue StandardError => exception
    yell exception.message
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
    @num_accounts_to_be_purged = 0
    @start_time = Time.now

    start_activity_log
  end

  def start_activity_log
    @log.puts "Starting purge_expired_child_accounts!"
    @log.puts "(dry-run)" if @dry_run
  end

  def check_constraints(accounts)
    if accounts.count > @max_accounts_to_purge
      @purge_size_limit_exceeded = 1
      raise SafetyConstraintViolation, "Found #{accounts.count} " \
        "accounts to purge, which exceeds the configured limit of " \
        "#{@max_accounts_to_purge}. Abandoning run."
    end
  end

  def expired_child_accounts
    User.expired_child_accounts
  end

  def report_results
    metrics = build_metrics
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
    end

    upload_metrics metrics unless @dry_run
  end

  def build_metrics
    {
      # Number of accounts purged during this run
      ChildAccountsPurged: @num_accounts_purged,
      # Number of accounts which need to be purged during this run
      ChildAccountsToBePurged: @num_accounts_to_be_purged,
      # 0 or 1 if the size of the purge would exceed the limit
      PurgeSizeLimitExceeded: @purge_size_limit_exceeded
    }
  end

  def metric_name(name)
    "Custom/ExpiredChildAccountPurger/#{name}"
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
    Cdo::Metrics.push('ExpiredChildAccountPurger', aws_metrics)
  end

  def build_summary(review_queue_depth, manual_reviews_needed)
    formatted_duration = Time.at(Time.now.to_i - @start_time.to_i).utc.strftime("%H:%M:%S")

    summary = expired_accounts_summary
    summary += "\n" + purged_accounts_summary
    summary + "\n🕐 #{formatted_duration}"
  end

  def purged_accounts_summary
    intro = @dry_run ? 'Would have purged' : 'Purged'
    "#{intro} #{@num_accounts_purged} account(s)."
  end

  def expired_accounts_summary
    "#{@num_accounts_to_be_purged} account(s) have expired."
  end

  # @return [String] HTML link to view uploaded log
  def upload_activity_log
    log_url = AWS::S3::LogUploader.
      new('cdo-audit-logs', "expired-child-account-purger-activity/#{CDO.rack_env}").
      upload_log(@start_time.strftime('%Y%m%dT%H%M%S%z'), @log.string)
    " <a href='#{log_url}'>☁ Log on S3</a>"
  end

  # Send error messages to #cron-daily and #user-accounts
  def yell(message)
    @log.puts message
    say message, 'cron-daily', color: 'red', notify: 1
    say message, 'user-accounts', color: 'red', notify: 1
  end

  # Send warning messages to #cron-daily and #user-accounts
  def warn(message)
    say message, 'cron-daily', color: 'yellow'
    say message, 'user-accounts', color: 'yellow'
  end

  # Send messages to Slack #cron-daily
  def say(message, channel = 'cron-daily', options = {})
    ChatClient.message channel, prefixed(message), options
  end

  def prefixed(message)
    "*ExpiredChildAccountPurger*#{@dry_run ? ' (dry-run)' : ''}" \
    " <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard
/lib/expired_child_account_purger.rb|(source)>" \
    "\n#{message}"
  end
end
