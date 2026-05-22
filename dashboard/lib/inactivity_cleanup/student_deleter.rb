# frozen_string_literal: true

module InactivityCleanup
  class StudentDeleter < BaseDeleter
    LOGGING_NAMESPACE = 'Platform/InactiveStudentDeleter'
    EVENT_NAME = 'inactive_student_deleter'

    def user_scope
      ::Student.all
    end
  end
end
