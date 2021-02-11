# This can be viewed on non-production environments at /rails/mailers/teacher_mailer
class TeacherMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def new_teacher_email_preview
    teacher = build :teacher, email: 'fake_email@fake.com'
    TeacherMailer.new_teacher_email(teacher)
  end
end
