# frozen_string_literal: true

module InactivityCleanup
  # Only delete teacher accounts where a deletion warning email has been sent over 30 days ago.
  class TeacherDeleter < BaseDeleter
    LOGGING_NAMESPACE = 'Platform/InactiveTeacherDeleter'
    EVENT_NAME = 'inactive_teacher_deleter'

    DELETION_WARNING_GRACE_PERIOD = 30.days

    def user_scope
      ::Teacher.
        joins(:user_data_retention_status).
        merge(User::DataRetentionStatus.where(deletion_warning_email_sent_at: ...DELETION_WARNING_GRACE_PERIOD.ago))
    end
  end
end
