class TeacherMailer < ActionMailer::Base
  default from: 'Hadi Partovi <hadi_partovi@code.org>'

  # Email a parent when a student upgrades to a username/password account by adding a parent email
  def new_teacher_email(teacher)
    @teacher = teacher
    mail to: teacher.email, subject: I18n.t('teacher_mailer.new_teacher_subject')
  end
end
