class Services::RegistrationReminder
  # This method sends enrollment reminder emails for any applications that are eligible for a
  # reminder.  It is designed to be called repeatedly (e.g. from a cronjob).
  #
  # This is an enrollment reminder email for any teacher that has been accepted, but has not
  # registered in a workshop. This form will automatically be sent 2 weeks after the first
  # registration email was sent. If the teacher is still not registered after another 1 week,
  # a second (and last) email will be sent.
  def self.send_registration_reminders!
    (
      applications_needing_first_reminder |
      applications_needing_second_reminder
    ).each do |application|
      application.send_pd_application_email 'registration_reminder'
    end
  end

  # Locate all applications that are eligible to receive their first workshop registration
  # reminder email now.
  # @return [Enumerable<Pd::Application::ApplicationBase>]
  def self.applications_needing_first_reminder
    # The 'accepted' email was sent at least one week ago
    # No 'registration_reminder' has been sent yet.
    # Not enrolled in a workshop since the 'accepted' email was sent
    applications_awaiting_enrollment.
      where("accepted.sent_at <= ?", 1.week.ago).
      where(registration_reminder: {id: nil})
  end

  # Locate all applications that are eligible to receive their second workshop registration
  # reminder email now.
  # @return [Enumerable<Pd::Application::ApplicationBase>]
  def self.applications_needing_second_reminder
    # Both 'accepted' and 'registration_reminder' emails were sent.
    # Only one 'registration_reminder' email has been sent.
    # The 'registration_reminder' email was sent at least one week ago.
    # Not enrolled in a workshop since the 'accepted' email was sent.
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
      joins(<<~SQL.squish).
        inner join pd_application_emails accepted
        on pd_applications.id = accepted.pd_application_id
        and accepted.email_type = 'accepted'
      SQL
      joins(<<~SQL.squish).
        left outer join pd_application_emails registration_reminder
        on pd_applications.id = registration_reminder.pd_application_id
        and registration_reminder.email_type = 'registration_reminder'
      SQL
      joins(<<~SQL.squish).
        left outer join pd_enrollments
        on pd_applications.user_id = pd_enrollments.user_id
        and pd_enrollments.created_at >= accepted.sent_at
      SQL
      joins(<<~SQL.squish).
        left outer join pd_workshops
        on pd_workshops.id = CAST(JSON_EXTRACT(pd_applications.form_data, '$.pd_workshop_id') AS UNSIGNED)
      SQL
      where(pd_applications: {application_year: Pd::Application::ActiveApplicationModels::APPLICATION_CURRENT_YEAR}).
      where(pd_enrollments: {id: nil}).
      where(pd_workshops: {deleted_at: nil}).
      distinct
  end
end
