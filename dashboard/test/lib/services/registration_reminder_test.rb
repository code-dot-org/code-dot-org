require 'test_helper'

class Services::RegistrationReminderTest < ActiveSupport::TestCase
  test 'queue_registration_reminders!' do
    # The expected behavior of this method is to find applications needing registration reminder
    # emails and queue up the emails to be sent at the appropriate times.  It runs on a cronjob.
    # Here, we walk through the typical flow for an application and verify that emails are queued
    # at the appropriate moments.
    #
    Timecop.freeze do
      # Initial creation: No reminders
      application = create :pd_teacher2021_application
      Services::RegistrationReminder.queue_registration_reminders!
      assert_empty application.emails.where(email_type: 'registration_reminder')

      # Fake sending first registration email
      Timecop.travel 1.day
      create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: DateTime.now
      Services::RegistrationReminder.queue_registration_reminders!
      assert_empty application.emails.where(email_type: 'registration_reminder')

      # First email is due in 14 days. At 13 days, no email yet:
      Timecop.travel 13.days
      Services::RegistrationReminder.queue_registration_reminders!
      assert_empty application.emails.where(email_type: 'registration_reminder')

      # At 14 days, email is sent on schedule:
      Timecop.travel 1.day
      Services::RegistrationReminder.queue_registration_reminders!
      assert_equal 1, application.emails.where(email_type: 'registration_reminder').count

      # Immediate re-run does not create another reminder
      Services::RegistrationReminder.queue_registration_reminders!
      assert_equal 1, application.emails.where(email_type: 'registration_reminder').count

      # Fake sending the email from the queue
      application.emails.
        where(email_type: 'registration_reminder', sent_at: nil).
        update(sent_at: DateTime.now)

      # Next email is due in 7 days.  At 6 days, only the one reminder has been sent:
      Timecop.travel 6.days
      Services::RegistrationReminder.queue_registration_reminders!
      assert_equal 1, application.emails.where(email_type: 'registration_reminder').count

      # At 7 days, the second reminder is sent on schedule:
      Timecop.travel 1.day
      Services::RegistrationReminder.queue_registration_reminders!
      assert_equal 2, application.emails.where(email_type: 'registration_reminder').count

      # Immediate re-run does not create another reminder
      Services::RegistrationReminder.queue_registration_reminders!
      assert_equal 2, application.emails.where(email_type: 'registration_reminder').count

      # Fake sending the email from the queue
      application.emails.
        where(email_type: 'registration_reminder', sent_at: nil).
        update(sent_at: DateTime.now)

      # That's the last one - no more reminders are sent
      Timecop.travel 30.days
      Services::RegistrationReminder.queue_registration_reminders!
      assert_equal 2, application.emails.where(email_type: 'registration_reminder').count
    end
  end

  test 'applications_needing_first_reminder omits applications with no registration email' do
    assert_equal 0, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder omits applications with unsent registration email' do
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: nil
    assert_equal 0, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder omits applications with recent registration email' do
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 13.days.ago
    assert_equal 0, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder omits applications that already created a registration reminder' do
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: nil
    assert_equal 0, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder omits teachers already enrolled' do
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    create :pd_enrollment, user: application.user
    assert_equal 0, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder omits applications prior to October 2019' do
    # This application was created before these reminder emails were added
    application = create :pd_teacher1920_application, created_at: DateTime.new(2019, 9, 30)
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    assert_equal 0, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder includes eligible applications' do
    # This application meets all the requirements: A two-week-old registration email
    # and no enrollment or reminder
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    assert_equal 1, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder old enrollments do not make an application ineligible' do
    # An old enrollment does not render this application ineligible for a reminder email
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    create :pd_enrollment, user: application.user, created_at: 1.year.ago
    assert_equal 1, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_first_reminder does not double reminder emails for malformed records' do
    # This malformed application with two registration_sent emails should only produce one result
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    assert_equal 1, Services::RegistrationReminder.applications_needing_first_reminder.count
  end

  test 'applications_needing_second_reminder omits applications with no emails' do
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder omits applications with unsent reminder email' do
    application = create :pd_teacher2021_application
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: nil
  end

  test 'applications_needing_second_reminder omits applications with recent reminder email' do
    # Does not include applications where the first reminder was sent less than a week ago
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 6.days.ago
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder omits applications with two reminder emails' do
    # An application that already created its second reminder is not eligible
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: nil
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder omits teachers who already enrolled' do
    # Does not include applications where the teacher is already enrolled in a workshop
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    create :pd_enrollment, user: application.user
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder omits malformed applications with no registration email' do
    # This malformed application with a 'registration_reminder' but no 'registration_sent' does
    # not receive another reminder
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder omits applications prior to October 2019' do
    # This application was created before we added these notifications
    application = create :pd_teacher2021_application, created_at: DateTime.new(2019, 9, 30)
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    assert_equal 0, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder includes eligible applications' do
    # This application meets all the requirements: A registration email, a reminder email at least
    # a week old, and no second reminder or enrollment.
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    assert_equal 1, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder old enrollments do not make an application ineligible' do
    # An old enrollment does not render this application ineligible for a reminder email
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 2.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    create :pd_enrollment, user: application.user, created_at: 1.year.ago
    assert_equal 1, Services::RegistrationReminder.applications_needing_second_reminder.count
  end

  test 'applications_needing_second_reminder does not double reminder emails for malformed records' do
    # This malformed application with two 'registration_sent' emails should only produce one result
    application = create :pd_teacher2021_application
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_sent', sent_at: 3.weeks.ago
    create :pd_application_email, application: application, email_type: 'registration_reminder', sent_at: 1.week.ago
    assert_equal 1, Services::RegistrationReminder.applications_needing_second_reminder.count
  end
end
