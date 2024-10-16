class TeacherMailer < ApplicationMailer
  default from: 'Hadi Partovi <hadi_partovi@code.org>'
  default reply_to: 'Code.org <support@code.org>'

  def delete_teacher_email(teacher, removed_students)
    @teacher = teacher
    @removed_students = removed_students
    mail to: teacher.email, from: 'noreply@code.org', subject: I18n.t('teacher_mailer.delete_teacher_subject')
  end

  def verified_teacher_email(teacher)
    mail to: teacher.email, from: 'teacher@code.org', subject: I18n.t('teacher_mailer.verified_teacher_subject')
  end

  def hoc_tutorial_email(teacher_name, teacher_email, lesson_plan_html_url)
    @teacher_name = teacher_name
    @lesson_plan_html_url = lesson_plan_html_url
    mail to: teacher_email,
      subject: I18n.t('hoc_tutorial_email_subject'),
      template_path: 'teacher_mailer',
      template_name: 'hour_of_code_tutorial_email'
  end
end
