require 'test_helper'
require 'email_reminder'

class EmailReminderTest < ActiveSupport::TestCase
  test 'finds a permission request that needs a reminder' do
    student = create :student
    student.update(child_account_compliance_state: 'not_g')
    request = ParentalPermissionRequest.create(user_id: student.id, parent_email: 'foo-parent@code.org')
    request.update(created_at: 4.days.ago)
    email_reminder = EmailReminder.new
    reqs = email_reminder.find_requests_needing_reminder

    assert_equal 1, reqs.length
    assert_equal request.id, reqs[0].id
  end

  test 'does not find a permission request that too old to require a reminder' do
    student = create :student
    student.update(child_account_compliance_state: 'not_g')
    request = ParentalPermissionRequest.create(user_id: student.id, parent_email: 'foo-parent@code.org')
    request.update(created_at: 10.days.ago)
    email_reminder = EmailReminder.new
    reqs = email_reminder.find_requests_needing_reminder

    assert_equal 0, reqs.length
  end

  test 'does not find a permission request that is too new to require a reminder' do
    student = create :student
    student.update(child_account_compliance_state: 'not_g')
    request = ParentalPermissionRequest.create(user_id: student.id, parent_email: 'foo-parent@code.org')
    request.update(created_at: 1.day.ago)
    email_reminder = EmailReminder.new
    reqs = email_reminder.find_requests_needing_reminder

    assert_equal 0, reqs.length
  end

  test 'sends a reminder email and increments reminder count' do
    student = create :student
    student.update(child_account_compliance_state: 'not_g')
    request = ParentalPermissionRequest.create(user_id: student.id, parent_email: 'foo-parent@code.org')
    request.update(created_at: 4.days.ago)
    email_reminder = EmailReminder.new
    email_reminder.send_all_reminder_emails

    email = ActionMailer::Base.deliveries.last
    assert_not_nil email
    assert_equal request.parent_email, email.to[0]
    assert_equal 1, ParentalPermissionRequest.find(request.id).reminders_sent
  end
end
