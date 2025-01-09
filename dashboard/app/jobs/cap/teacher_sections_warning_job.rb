# frozen_string_literal: true

module CAP
  class TeacherSectionsWarningJob < ApplicationJob
    EVENT_NAME = 'cap_teacher_sections_warning'
    MAILJET_RETRY_LIMIT = 5

    rescue_from StandardError, with: :report_exception

    def perform
      teachers.find_each do |teacher|
        next if teacher.email.blank?

        cap_section_ids = []
        email_cap_sections = []

        cap_affected_sections.where(user: teacher).find_each do |section|
          cap_section_ids << section.id
          email_cap_sections << {
            Name: section.name,
            Link: section.manage_students_url,
          }
        end

        send_warning_email(teacher.email, teacher.name, email_cap_sections)

        Metrics::Events.log_event(
          event_name: EVENT_NAME,
          metadata: {
            teacher_id: teacher.id,
            cap_section_ids: cap_section_ids,
          }
        )
      end
    end

    private def cap_affected_sections
      @cap_affected_sections ||= Queries::Section.cap_affected(
        scope: ::Section.visible,
        period: Policies::ChildAccount::TEACHER_WARNING_PERIOD.ago..
      )
    end

    private def teachers
      @teachers ||= User.where(id: cap_affected_sections.select(:user_id))
    end

    private def send_warning_email(email, name, cap_sections)
      Retryable.retryable(
        on: RestClient::TooManyRequests,
        tries: MAILJET_RETRY_LIMIT,
        sleep: ->(n) {2 ** n}
      ) do
        MailJet.send_email(
          :cap_section_warning,
          email,
          name,
          vars: {
            capSections: cap_sections,
          }
        )
      end
    end
  end
end
