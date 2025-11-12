# frozen_string_literal: true

require 'cdo/aws/metrics'
require_relative '../../lib/cdo/mailjet'

# Queries for teacher accounts that have been Inactive for more than
# 3.5 years and sends them a warning email about impending deletion.
class InactiveTeacherDeletionWarningEmailer
  class SafetyConstraintViolation < RuntimeError; end
  EVENT_NAME = 'inactive_teacher_deletion_warning_sent'

  LOGGING_NAMESPACE = 'Platform/InactiveTeacherDeletionWarningJob'
  INACTIVE_TEACHER_DELETION_WARNING_LIMIT = 8_000
  BATCH_SIZE = 1_000

  def initialize(dry_run: false, limit: INACTIVE_TEACHER_DELETION_WARNING_LIMIT)
    @dry_run = dry_run.nil? ? false : dry_run
    raise ArgumentError.new('dry_run must be boolean') unless [true, false].include? @dry_run
    @limit = limit || INACTIVE_TEACHER_DELETION_WARNING_LIMIT
    raise ArgumentError.new('limit must be Integer') unless @limit.is_a? Integer
    # Users that we don't want to include in paged batches. Includes users who have already been processed.
    @processed_user_ids = []
    reset_metrics
  end

  def call
    reset_metrics
    log_message("Starting InactiveTeacherDeletionWarningEmailer with dry_run=#{@dry_run}, limit=#{@limit}")
    ActiveRecord::Base.connected_to(role: :reporting) do
      loop do
        accounts_batch = inactive_teachers
        break if accounts_batch.empty? || num_teachers_warned >= @limit
        accounts_batch.each do |teacher|
          next if teacher.email.blank?
          send_warning_email(teacher)
          # Set email sent at field
          mark_warning_email_sent(teacher.id)
          self.num_teachers_warned += 1

          Metrics::Events.log_event(
            event_name: EVENT_NAME,
            metadata: {
              teacher_id: teacher.id,
            }
          )
        ensure
          processed_teacher_ids << teacher.id
        end
        break if accounts_batch.size < BATCH_SIZE || num_teachers_warned >= @limit
      end
    end
    if @dry_run
      log_message("Dry run complete: would email #{num_teachers_warned} teacher accounts.")
    else
      log_message(format("Emailed %d teacher accounts in %.2f seconds.", num_teachers_warned, (Time.now - start_time)))
    end
  rescue StandardError => exception
    report_exception(exception)
  end

  def processed_teacher_ids
    @processed_teacher_ids ||= []
  end

  private attr_accessor :num_teachers_warned, :start_time

  private def inactive_teachers
    inactive_since = 41.months.ago

    # Base query for all teachers inactive since the threshold
    inactive_query = Queries::User::Inactive.new(
      scope: ::Teacher.all,
      inactive_since: inactive_since
    )

    result = inactive_query.call.left_outer_joins(:user_data_retention_status)

    # Filter teachers who haven't been emailed yet or need a re-send,
    # and exclude already processed teachers, then limit to batch size
    result.
    where(user_data_retention_status: {deletion_warning_email_sent_at: nil}).
    or(result.where(user_data_retention_status: {deletion_warning_email_sent_at: ..inactive_since})).
    where.not(id: processed_teacher_ids).
    limit(BATCH_SIZE)
  end

  private def send_warning_email(user)
    return if @dry_run
    Retryable.retryable(
      on: RestClient::TooManyRequests,
      tries: MailJet::MAILJET_RETRY_LIMIT,
      sleep: ->(n) {2 ** n}
    ) do
      MailJet.send_email(
        :inactive_teacher_deletion_warning,
        user.email,
        user.name,
        vars: {first_name: user.given_name.presence || user.name.presence || "Code.org user"},
      )
    end
  end

  private def mark_warning_email_sent(teacher_id)
    ActiveRecord::Base.connected_to(role: :writing) do
      user_data_retention_status = ::User::DataRetentionStatus.find_or_initialize_by(user_id: teacher_id)
      user_data_retention_status.update!(deletion_warning_email_sent_at: Time.current)
    end
  end

  private def log_message(message)
    CDO.log.info({event: message, namespace: LOGGING_NAMESPACE})
  end

  private def reset_metrics
    self.num_teachers_warned = 0
    self.start_time = Time.now
  end
end
