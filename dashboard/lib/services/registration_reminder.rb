class Services::RegistrationReminder
  # Don't send reminders for applications created prior to this date
  REMINDER_START_DATE = Date.new(2019, 10, 1)

  # This method queues enrollment reminder emails for any applications that are eligible for a
  # reminder.  It is designed to be called repeatedly (e.g. from a cronjob).
  #
  # This is an enrollment reminder email for any teacher that has been accepted, but has not
  # registered in a workshop. This form will automatically be sent 2 weeks after the first
  # registration email was sent. If the teacher is still not registered after another 1 week,
  # a second (and last) email will be sent.
  def self.queue_registration_reminders!
    (
      applications_needing_first_reminder |
      applications_needing_second_reminder
    ).each do |application|
      application.queue_email 'registration_reminder'
    end
  end

  # Locate all applications that are eligible to receive their first workshop registration
  # reminder email now.
  # @return [Enumerable<Pd::Application::ApplicationBase>]
  def self.applications_needing_first_reminder
    # The 'registration_sent' email was sent at least two weeks ago
    # No 'registration_reminder' has been sent yet.
    # Not enrolled in a workshop since the 'registration_sent' email was sent
    applications_awaiting_enrollment.
      where("registration_sent.sent_at <= ?", 2.weeks.ago).
      where("registration_reminder.id is null")
  end

  # Locate all applications that are eligible to receive their second workshop registration
  # reminder email now.
  # @return [Enumerable<Pd::Application::ApplicationBase>]
  def self.applications_needing_second_reminder
    # Both 'registration_sent' and 'registration_reminder' emails were sent.
    # Only one 'registration_reminder' email has been sent.
    # The 'registration_reminder' email was sent at least one week ago.
    # Not enrolled in a workshop since the 'registration_sent' email was sent.
    applications_awaiting_enrollment.
      where('registration_reminder.sent_at <= ?', 1.week.ago).
      reject {|a| a.emails.where(email_type: 'registration_reminder').count > 1}
  end

  # Locate all applications for applicants that have been sent an initial workshop registration
  # email but have not enrolled in a workshop since that email was sent.
  # @return [ActiveRecord::Relation<Pd::Application::ApplicationBase>]
  def self.applications_awaiting_enrollment
    # Additional clauses in this query, shared by the helpers above:
    # - Join against registration reminders as well, which is useful for filtering later.
    # - Exclude applications created prior to the fall 2019 application season, when this feature launched.
    # - SELECT DISTINCT since we never want to list an application more than once.
    Pd::Application::ApplicationBase.
      joins(<<~SQL).
        inner join pd_application_emails registration_sent
        on pd_applications.id = registration_sent.pd_application_id
        and registration_sent.email_type = 'registration_sent'
      SQL
      joins(<<~SQL).
        left outer join pd_application_emails registration_reminder
        on pd_applications.id = registration_reminder.pd_application_id
        and registration_reminder.email_type = 'registration_reminder'
      SQL
      joins(<<~SQL).
        left outer join pd_enrollments
        on pd_applications.user_id = pd_enrollments.user_id
        and pd_enrollments.created_at >= registration_sent.sent_at
      SQL
      where("pd_applications.created_at >= ?", REMINDER_START_DATE).
      where('pd_enrollments.id is null').
      distinct
  end
end
