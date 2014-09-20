class FollowerMailer < ActionMailer::Base
  default from: 'noreply@code.org'

  def invite_student(teacher, student)
    @teacher = teacher

    mail to: student.email, subject: I18n.t('follower.mail.invite_student.subject')
  end

  def invite_new_student(teacher, student_email)
    @teacher = teacher

    mail to: student_email, subject: I18n.t('follower.mail.invite_student.subject')
  end

  def student_disassociated_notify_teacher(teacher, student)
    @teacher = teacher
    @student = student
    
    mail to: teacher.email, subject: I18n.t('follower.mail.student_disassociated.subject', student_name: @student.name)
  end

  def teacher_disassociated_notify_student(teacher, student)
    @teacher = teacher
    @student = student
    
    mail to: student.email, subject: I18n.t('follower.mail.teacher_disassociated.subject', teacher_name: @teacher.name) if student.email.present?
  end
end
