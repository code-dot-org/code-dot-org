require 'stringio'
require 'cdo/aws/metrics'
require 'cdo/aws/s3'
require 'cdo/chat_client'

class EmailReminder
  include Rails.application.routes.url_helpers
  attr_reader :max_reminder_age, :min_reminder_age, :dry_run, :log

  # Max reminders we want to send over the lifetime of a permission request
  # Currently, we only want to send 1 reminder to a parent for CPA compliance.
  MAX_LIFETIME_REMINDERS = 1

  def initialize(options = {})
    # Oldest requests we want to send reminders for. Defaults to 7 days ago.
    @max_reminder_age = options[:max_reminder_age] || 7.days.ago
    raise ArgumentError.new('max_reminder_age must be Time') unless @max_reminder_age.is_a? Time

    # Newest requests we want to send reminders for. Defaults to 3 days ago.
    @min_reminder_age = options[:min_reminder_age] || 3.days.ago
    raise ArgumentError.new('min_reminder_age must be Time') unless @min_reminder_age.is_a? Time
    raise ArgumentError.new('max_reminder_age must come before min_reminder_age') unless @max_reminder_age < @min_reminder_age

    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run

    reset
    @log.puts "Initialized with options: #{options.inspect}"
  end

  # Find permission requests for users who haven't been granted permission yet.
  # Only find requests that are between max_reminder_age and min_reminder_age old.
  # Only find requests that have sent fewer than max_reminders reminders.
  # Return the IDs of the requests.
  def find_requests_needing_reminder
    ParentalPermissionRequest.joins(:user).
      select(:id).
      where(created_at: @max_reminder_age..@min_reminder_age).
      where(reminders_sent: ...MAX_LIFETIME_REMINDERS).
      where("JSON_EXTRACT(users.properties, '$.child_account_compliance_state') != ?", User::ChildAccountCompliance::PERMISSION_GRANTED)
  end

  # Send a reminder for a given ParentalPermissionRequest ID.
  # Increment the reminders_sent count.
  def send_permission_reminder_email(request_id)
    request = ParentalPermissionRequest.find(request_id)
    permission_url = url_for(controller: :policy_compliance, action: :child_account_consent, host: CDO.studio_url('', CDO.default_scheme), token: request.uuid)
    mail = ParentMailer.parent_permission_reminder(request.parent_email, permission_url)
    unless @dry_run
      mail.deliver_now
      request.reminders_sent += 1
      request.save!
    end
  end

  # Send emails for all requests that need reminders.
  def send_all_reminder_emails
    find_requests_needing_reminder.find_each do |request|
      send_permission_reminder_email request.id
      @num_reminders_sent += 1
    end
  end

  private

  def reset
    @log = StringIO.new

    # Other values tracked internally and reset with every run
    @num_reminders_sent = 0
    @start_time = Time.now

    start_activity_log
  end

  def start_activity_log
    @log.puts "Sending reminders for permission requests created between #{@max_reminder_age} and #{@min_reminder_age}"
  end

  def report_results
    metrics = {
      PermissionRemindersSent: @num_reminders_sent,
    }
    log_metrics metrics

    summary = build_summary
    @log.puts summary

    log_link = upload_activity_log
    say "#{summary} #{log_link}"
    upload_metrics metrics
  end

  def metric_name(name)
    "Custom/PermissionEmailReminders/#{name}"
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
    Cdo::Metrics.push('PermissionEmailReminders', aws_metrics)
  end

  def build_summary
    formatted_duration = Time.at(Time.now.to_i - @start_time.to_i).utc.strftime("%H:%M:%S")
    summary = "Sent #{@num_reminders_sent} permission reminder(s)"
    summary += "\n🕐 #{formatted_duration}"
    if @dry_run
      summary += "IMPORTANT: This was a dry run. No emails were sent."
    end
    summary
  end

  # @return [String] HTML link to view uploaded log
  def upload_activity_log
    log_url = AWS::S3::LogUploader.
      new(AWS::S3::LogUploader::LogBucketNames::AUDIT_LOGS_BUCKET, "permission-email-reminder-activity/#{CDO.rack_env}").
      upload_log(@start_time.strftime('%Y%m%dT%H%M%S%z'), @log.string)
    " <a href='#{log_url}'>☁ Log on S3</a>"
  end

  # Send messages to Slack #cron-daily
  def say(message, channel = 'cron-daily', options = {})
    ChatClient.message channel, prefixed(message), options
  end

  def prefixed(message)
    "*Parent Permission Email Reminders*" \
    " <https://github.com/code-dot-org/code-dot-org/blob/production/dashboard
/lib/email_reminder.rb|(source)>" \
    "\n#{message}"
  end
end
