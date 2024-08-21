require 'metrics/events'
require 'services/child_account'

module CAP
  # Sends an email to a teacher warning them about which sections have students
  # currently being affected by our Child Account Policy(CAP).
  class SectionsWarningEmailSender < ApplicationJob
    rescue_from StandardError, with: :report_exception

    def perform(teacher_id:, section_ids:)
      return unless teacher_id
      teacher = User.find_by_id(teacher_id)
      return unless teacher

      return if section_ids.nil_or_empty?
      sections = Section.where(id: section_ids)
      return if sections.nil_or_empty?

      send_warning_email(teacher, sections)
      log_metrics(teacher)
    end

    private def log_metrics(teacher)
      Services::ChildAccount::EventLogger.log_sections_warning_email_sent(teacher)
      Metrics::Events.log_event(
        user: teacher,
        event_name: 'CAP Sections Warning Email Sent',
        metadata: {
          'template' => :cap_section_warning.to_s,
        }
      )
    end
    private def send_warning_email(teacher, sections)
      template_variables = {}
      template_variables[:sections] = sections.map do |section|
        {
          Name: section.name,
          Link: section.manage_students_url,
        }
      end
      MailJet.send_teacher_cap_section_warning(teacher, template_variables)
    end

    private def report_exception(exception)
      Honeybadger.notify(
        exception,
        error_message: '[CAP::SectionsWarningEmailSender] Runtime error',
        context: {
          job: as_json,
        }
      )
    ensure
      raise exception
    end
  end
end
