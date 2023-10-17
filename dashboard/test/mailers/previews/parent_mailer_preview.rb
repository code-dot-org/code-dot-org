# This can be viewed on non-production environments at /rails/mailers/parent_mailer
class ParentMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods

  def parent_email_added_to_student_account_preview
    student = build :student
    ParentMailer.parent_email_added_to_student_account('fake_email@fake.com', student)
  end

  def parent_permission_request_preview
    ParentMailer.parent_permission_request('parent@test.com', 'https://code.org/permission')
  end

  def parent_permission_reminder_preview
    ParentMailer.parent_permission_reminder('parent@test.com', 'https://code.org/permission')
  end

  def parent_permission_confirmation_preview
    ParentMailer.parent_permission_confirmation('parent@test.com')
  end
end
