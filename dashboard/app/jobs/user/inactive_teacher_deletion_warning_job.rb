# frozen_string_literal: true

require_relative '../../../../lib/cdo/mailjet'

class User
  class InactiveTeacherDeletionWarningJob < ApplicationJob
    EVENT_NAME = 'inactive_teacher_deletion_warning'
    MAILJET_RETRY_LIMIT = 5

    rescue_from StandardError, with: :report_exception

    def perform
      inactive_teachers.find_each do |teacher|
        next if teacher.email.blank?
        send_warning_email(teacher)
        # Set email sent at field
        user_data_retention_status = ::User::DataRetentionStatus.find_or_initialize_by(user_id: teacher.id)
        user_data_retention_status.deletion_warning_email_sent_at = Time.current
        user_data_retention_status.save!

        Metrics::Events.log_event(
          event_name: EVENT_NAME,
          metadata: {
            teacher_id: teacher.id,
          }
        )
      end
    end

    private def inactive_teachers
      inactive_query = Queries::User::Inactive.new(
        scope: ::User.where(user_type: TYPE_TEACHER),
        inactive_since: 41.months.ago,
        query_with_warning: true,
      )
      @inactive_teachers ||= inactive_query.call
    end

    private def send_warning_email(user)
      Retryable.retryable(
        on: RestClient::TooManyRequests,
        tries: MAILJET_RETRY_LIMIT,
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
  end
end
