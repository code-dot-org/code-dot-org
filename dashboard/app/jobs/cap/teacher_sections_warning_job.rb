# frozen_string_literal: true

module CAP
  class TeacherSectionsWarningJob < ApplicationJob
    rescue_from StandardError, with: :report_exception

    def perform
      teachers.find_each do |teacher|
        teacher_cap_affected_sections = cap_affected_sections.where(user: teacher)

        email_template_vars = {
          capSections: teacher_cap_affected_sections.find_each.map do |section|
            {
              Name: section.name,
              Link: section.manage_students_url,
            }
          end
        }

        MailjetDeliveryJob.perform_later(
          :cap_section_warning,
          teacher.email,
          teacher.name,
          vars: email_template_vars
        )
      end
    end

    private def cap_affected_sections
      @cap_affected_sections ||= Queries::Section.cap_affected(
        period: Policies::ChildAccount::MAX_AGE_GATE_DURATION_TO_STOP_TEACHER_SECTIONS_WARNING.ago..
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
