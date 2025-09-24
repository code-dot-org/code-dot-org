# frozen_string_literal: true

require_relative '../../../../lib/cdo/mailjet'

class User
  class InactiveTeacherDeletionWarningJob < ApplicationJob
    EVENT_NAME = 'inactive_teacher_deletion_warning_sent'

    rescue_from StandardError, with: :report_exception

    def perform
      inactive_teachers.find_each do |teacher|
        next if teacher.email.blank?
        send_warning_email(teacher)
        # Set email sent at field
        mark_warning_email_sent(teacher.id)

        Metrics::Events.log_event(
          event_name: EVENT_NAME,
          metadata: {
            teacher_id: teacher.id,
          }
        )
      end
    end

    private def inactive_teachers
      inactive_since = 41.months.ago
      inactive_query = Queries::User::Inactive.new(
        scope: ::Teacher.all,
        inactive_since: inactive_since,
      )
      result = inactive_query.call.left_outer_joins(:user_data_retention_status)
      @inactive_teachers ||= result.where(user_data_retention_status: {deletion_warning_email_sent_at: nil}).
        or(result.where(user_data_retention_status: {deletion_warning_email_sent_at: ..inactive_since}))
    end

    private def send_warning_email(user)
      Retryable.retryable(
        on: RestClient::TooManyRequests,
        tries: MailJet::MAILJET_RETRY_LIMIT,
        sleep: ->(n) {2 ** n}
      ) do
        MailJet.send_email(
          :inactive_teacher_deletion_warning,
          user.email,
          user.name,
          vars: {first_name: user.given_name || user.name},
        )
      end
    end

    private def mark_warning_email_sent(teacher_id)
      user_data_retention_status = ::User::DataRetentionStatus.find_or_initialize_by(user_id: teacher_id)
      user_data_retention_status.update!(deletion_warning_email_sent_at: Time.current)
    end
  end
end
