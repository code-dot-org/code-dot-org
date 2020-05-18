# This can be viewed on non-production environments at /rails/mailers/parent_mailer
class ParentMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def parent_email_added_to_student_account_preview
    student = build :student
    ParentMailer.parent_email_added_to_student_account('fake_email@fake.com', student)
  end
end
