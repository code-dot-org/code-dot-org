class Services::CompleteApplicationReminder
  class << self
    # This method queues reminder emails for any incomplete applications that are eligible
    # for a reminder.  It is designed to be called repeatedly (e.g. from a cronjob).
    #
    # We send reminders to complete an application 7 days after an applicant has last saved their application,
    # another one 14 days after an applicant has last saved their application.
    def send_complete_application_reminders!
      applications_needing_initial_reminder.each do |application|
        application.send_pd_application_email 'complete_application_initial_reminder'
      end

      applications_needing_final_reminder.each do |application|
        application.send_pd_application_email 'complete_application_final_reminder'
      end
    end

    # Locate all applications that are eligible to receive their first "complete your application"
    # reminder, which is if they last saved it at least 7 days ago.
    # They should not receive more than one reminder of this type.
    # @return [Enumerable<Pd::Application::ApplicationBase>]
    def applications_needing_initial_reminder
      incomplete_applications_with_email.select do |app|
        most_recent_update = most_recently_updated(app)
        most_recent_update.before?(Time.zone.today - 6.days) && most_recent_update.after?(Time.zone.today - 14.days) &&
          app.emails.where(email_type: 'complete_application_initial_reminder').count == 0
      end
    end

    # Locate all applications that are eligible to receive their second "complete your application"
    # reminder, which is if they last saved at least 14 days ago.
    # They should not receive more than one reminder of this type.
    # @return [Enumerable<Pd::Application::ApplicationBase>]
    def applications_needing_final_reminder
      incomplete_applications_with_email.select do |app|
        most_recently_updated(app).before?(Time.zone.today - 13.days) &&
          app.emails.where(email_type: 'complete_application_final_reminder').count == 0
      end
    end

    private

    # Locate all incomplete applications for this year
    # @return [ActiveRecord::Relation<Pd::Application::ApplicationBase>]
    def incomplete_applications_with_email
      Pd::Application::TeacherApplication.
        where(application_year: Pd::Application::ActiveApplicationModels::APPLICATION_CURRENT_YEAR, status: 'incomplete').
        select do |app|
          app.email.present?
        end
    end

    def most_recently_updated(application)
      application.status_log.last['at']&.to_date
    end
  end
end
