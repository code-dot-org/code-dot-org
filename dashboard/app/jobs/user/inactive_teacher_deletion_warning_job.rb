# frozen_string_literal: true

module User
  class InactiveTeacherDeletionWarningJob < ApplicationJob
    EVENT_NAME = 'inactive_teacher_deletion_warning'
    MAILJET_RETRY_LIMIT = 5

    rescue_from StandardError, with: :report_exception

    def perform
      inactive_teachers.find_each do |teacher|
        next if teacher.email.blank?
        send_warning_email(teacher.email, teacher.name)
      end
    end

    private def inactive_teachers
      inactive_query = Queries::User::Inactive.new(inactive_since: 41.months.ago)
      @inactive_teachers ||= inactive_query.call
    end

    private def send_warning_email(email, name)
      Retryable.retryable(
        on: RestClient::TooManyRequests,
        tries: MAILJET_RETRY_LIMIT,
        sleep: ->(n) {2 ** n}
      ) do
        MailJet.send_email(
          :inactive_teacher_deletion_warning,
          email,
          name,
        )
      end
    end
  end
end
