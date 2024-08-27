# frozen_string_literal: true

module CAP
  class TeacherSectionsWarningJob < ApplicationJob
    EVENT_NAME = 'cap_teacher_sections_warning'

    rescue_from StandardError, with: :report_exception

    def perform
      teachers.find_each do |teacher|
        cap_section_ids = []
        email_cap_sections = []

        cap_affected_sections.where(user: teacher).find_each do |section|
          cap_section_ids << section.id
          email_cap_sections << {
            Name: section.name,
            Link: section.manage_students_url,
          }
        end

        MailjetDeliveryJob.perform_later(
          :cap_section_warning,
          teacher.email,
          teacher.name,
          vars: {
            capSections: email_cap_sections,
          }
        )

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
        period: Policies::ChildAccount::TEACHER_WARNING_PERIOD.ago..
      )
    end

    private def teachers
      return @teachers if defined? @teachers

      available_emails = DCDO.get('cap_teacher_section_warning_emails', [])
      return @teachers = User.none if available_emails.blank?

      @teachers = User.where(id: cap_affected_sections.select(:user_id))
      return @teachers if available_emails.include?('all')

      @teachers = @teachers.where(email: available_emails)
    end
  end
end
