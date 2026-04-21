class InactiveUserPurgeMailer < ApplicationMailer
  default from: 'Code.org <noreply@code.org>'
  default reply_to: 'Code.org <support@code.org>'

  # Sends a warning email to a teacher 30 days before their account is scheduled for soft deletion due to inactivity
  def teacher_inactivity_soft_delete_warning_email(teacher)
    @teacher = teacher
    mail to: teacher.email, subject: I18n.t('inactive_user_purge_mailer.teacher_soft_delete_warning_subject')
  end
end
