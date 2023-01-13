require 'test_helper'

class Services::CompleteApplicationReminderTest < ActiveSupport::TestCase
  test 'queue_registration_reminders!' do
    # The expected behavior of this method is to find applications needing incomplete reminder
    # emails and queue up the emails to be sent at the appropriate times.  It runs on a cronjob.
    # Here, we walk through the typical flow for an application and verify that emails are queued
    # at the appropriate moments.
    #
    Timecop.freeze do
      # Initial creation: No reminders
      application = create :pd_teacher_application, status: 'incomplete'
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_empty application.emails.where(email_type: 'complete_application_initial_reminder')
      assert_empty application.emails.where(email_type: 'complete_application_final_reminder')

      # First email is due in 7 days. At 6 days, no email yet:
      Timecop.travel 6.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_empty application.emails.where(email_type: 'complete_application_initial_reminder')

      # At 7 days, email is sent on schedule:
      Timecop.travel 1.day
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # Immediate re-run does not create another reminder
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # Fake sending the email from the queue
      application.emails.
        where(email_type: 'complete_application_initial_reminder', sent_at: nil).
        update(sent_at: DateTime.now)

      # Next email is due in 7 more days.  At 6 days, only the one reminder has been sent:
      Timecop.travel 6.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # At 7 days, the second reminder is sent on schedule and the first reminder is not sent again:
      Timecop.travel 1.day
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_final_reminder').count
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # Immediate re-run does not create another reminder
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_final_reminder').count

      # Fake sending the email from the queue
      application.emails.
        where(email_type: 'complete_application_final_reminder', sent_at: nil).
        update(sent_at: DateTime.now)

      # That's the last one - no more reminders are sent
      Timecop.travel 30.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_final_reminder').count
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count
    end
  end

  test 'queue_registration_reminders! takes into account user updates' do
    # Here, we walk through a flow for an application where a teacher is frequently
    # updating and saving their application and verify that emails are queued
    # at the appropriate moments.
    #
    Timecop.freeze do
      # Initial creation: No reminders
      application = create :pd_teacher_application, status: 'incomplete'
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_empty application.emails.where(email_type: 'complete_application_initial_reminder')
      assert_empty application.emails.where(email_type: 'complete_application_final_reminder')

      # 6 days later, a user updates their application and saves again, and no reminder is sent
      Timecop.travel 6.days
      application.update!(form_data: application.form_data_hash.merge(firstName: 'Simon').to_json)
      application.reload
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_empty application.emails.where(email_type: 'complete_application_initial_reminder')

      # 7 days from creation, no reminder is sent because of the update
      Timecop.travel 1.day
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_empty application.emails.where(email_type: 'complete_application_initial_reminder')

      # 7 days after the update, email is sent on schedule:
      Timecop.travel 6.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # Immediate re-run does not create another reminder
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # Fake sending the email from the queue
      application.emails.
        where(email_type: 'complete_application_initial_reminder', sent_at: nil).
        update(sent_at: DateTime.now)

      # 3 days later, a user updates their application, and no new reminder is sent
      Timecop.travel 3.days
      application.update!(form_data: application.form_data_hash.merge(firstName: 'Garfunkel').to_json)
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count

      # 7 days after original email was sent, no reminder is sent because of the update
      Timecop.travel 4.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count
      assert_empty application.emails.where(email_type: 'complete_application_final_reminder')

      # 14 days after last update, a second reminder is sent
      Timecop.travel 10.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count
      assert_equal 1, application.emails.where(email_type: 'complete_application_final_reminder').count

      # Fake sending the email from the queue
      application.emails.
        where(email_type: 'complete_application_final_reminder', sent_at: nil).
        update(sent_at: DateTime.now)

      # That's the last one - no more reminders are sent
      Timecop.travel 30.days
      Services::CompleteApplicationReminder.queue_complete_application_reminders!
      assert_equal 1, application.emails.where(email_type: 'complete_application_initial_reminder').count
      assert_equal 1, application.emails.where(email_type: 'complete_application_final_reminder').count
    end
  end
end
