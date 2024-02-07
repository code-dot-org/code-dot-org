require 'test_helper'
require 'email_reminder'
require 'mocha/mini_test'

class EmailReminderTest < ActiveSupport::TestCase
  setup do
    @student = create(:student, child_account_compliance_state: 'not_g')
    @request = create(:parental_permission_request, user_id: @student.id, parent_email: 'foo-parent@code.org')

    Cdo::Metrics.expects(:push).never
    Cdo::Metrics.stubs :push
    EmailReminder.any_instance.stubs :upload_metrics
    EmailReminder.any_instance.stubs :say
  end

  test 'finds a permission request that needs a reminder' do
    @request.update(created_at: 4.days.ago)
    email_reminder = EmailReminder.new
    reqs = email_reminder.find_requests_needing_reminder

    assert_equal 1, reqs.length
    assert_equal @request.id, reqs[0].id
  end

  test 'does not find a permission request that too old to require a reminder' do
    @request.update(created_at: 10.days.ago)
    email_reminder = EmailReminder.new
    reqs = email_reminder.find_requests_needing_reminder

    assert_equal 0, reqs.length
  end

  test 'does not find a permission request that is too new to require a reminder' do
    @request.update(created_at: 1.day.ago)
    email_reminder = EmailReminder.new
    reqs = email_reminder.find_requests_needing_reminder

    assert_equal 0, reqs.length
  end

  test 'sends a reminder email and increments reminder count' do
    @request.update(created_at: 4.days.ago)
    email_reminder = EmailReminder.new
    email_reminder.send_all_reminder_emails

    email = ActionMailer::Base.deliveries.last
    refute_nil email
    assert_equal @request.parent_email, email.to[0]
    assert_equal 1, @request.reload.reminders_sent
  end
end
