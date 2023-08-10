class FollowerMailer < ActionMailer::Base
  include ActionMailerMetrics
  default from: 'noreply@code.org'

  def student_disassociated_notify_teacher(teacher, student)
    @teacher = teacher
    @student = student

    mail to: teacher.email, subject: I18n.t('follower.mail.student_disassociated.subject', student_name: @student.name)
  end
end
