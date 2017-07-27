class TeacherMailer < ActionMailer::Base
  default from: 'Hadi Partovi <hadi_partovi@code.org>'

  # Send newly registered teachers a welcome email
  def new_teacher_email(teacher)
    @teacher = teacher
    mail to: teacher.email, subject: I18n.t('teacher_mailer.new_teacher_subject')
  end
end
