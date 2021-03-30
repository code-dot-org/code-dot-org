class TeacherMailer < ActionMailer::Base
  default from: 'Hadi Partovi <hadi_partovi@code.org>'

  # Send newly registered teachers a welcome email
  def new_teacher_email(teacher, teacher_locale = 'en-US')
    @teacher = teacher

    # We currently have two flavors for the new teacher welcome email,
    # en-US (the default) and es-MX.
    email_locale = teacher_locale.to_s == 'es-MX' ? teacher_locale : 'en-US'
    email_template = teacher_locale.to_s == 'es-MX' ? 'new_teacher_email_es-MX' : 'new_teacher_email'

    mail to: teacher.email,
      subject: I18n.t('teacher_mailer.new_teacher_subject', locale: email_locale),
      template_path: 'teacher_mailer',
      template_name: email_template
  end

  def delete_teacher_email(teacher, removed_students)
    @teacher = teacher
    @removed_students = removed_students
    mail to: teacher.email, from: 'noreply@code.org', subject: I18n.t('teacher_mailer.delete_teacher_subject')
  end
end
