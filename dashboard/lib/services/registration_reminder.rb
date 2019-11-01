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
    Pd::Application::ApplicationBase.
      joins("inner join pd_application_emails rs on pd_applications.id = rs.pd_application_id and rs.email_type = 'registration_sent'").
      joins("left outer join pd_application_emails rr on pd_applications.id = rr.pd_application_id and rr.email_type = 'registration_reminder'").
      joins("left outer join pd_enrollments e on pd_applications.user_id = e.user_id and e.created_at >= rs.sent_at").
      where("pd_applications.created_at >= ?", REMINDER_START_DATE).
      where("rs.sent_at <= ?", 2.weeks.ago).
      where("rr.id is null").
      where('e.id is null').
      distinct
  end

  # Locate all applications that are eligible to receive their second workshop registration
  # reminder email now.
  # @return [Enumerable<Pd::Application::ApplicationBase>]
  def self.applications_needing_second_reminder
    # Both 'registration_sent' and 'registration_reminder' emails were sent.
    # Only one 'registration_reminder' email has been sent.
    # The 'registration_reminder' email was sent at least one week ago.
    # Not enrolled in a workshop since the 'registration_sent' email was sent.
    Pd::Application::ApplicationBase.
      joins("inner join pd_application_emails rs on pd_applications.id = rs.pd_application_id and rs.email_type = 'registration_sent'").
      joins("inner join pd_application_emails rr on pd_applications.id = rr.pd_application_id and rr.email_type = 'registration_reminder'").
      joins("left outer join pd_enrollments e on pd_applications.user_id = e.user_id and e.created_at >= rs.sent_at").
      where("pd_applications.created_at >= ?", REMINDER_START_DATE).
      where('rr.sent_at <= ?', 1.week.ago).
      where('e.id is null').
      distinct.
      reject {|a| a.emails.where(email_type: 'registration_reminder').count > 1}
  end
end
