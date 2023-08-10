class ParentMailer < ActionMailer::Base
  include ActionMailerMetrics
  default from: 'Hadi Partovi <hadi_partovi@code.org>'
  default reply_to: 'Code.org <support@code.org>'

  # Email a parent when a student upgrades to a username/password account by adding a parent email
  def student_associated_with_parent_email(parent_email, student)
    @student = student

    mail to: parent_email, subject: I18n.t('parent_mailer.student_associated_subject')
  end

  def parent_email_added_to_student_account(parent_email, student)
    @student = student

    mail to: parent_email, subject: I18n.t('parent_mailer.parent_email_added_subject')
  end

  # Email for parents of students under 13 to grant permission for their child to have a Code.org account.
  # The email contains a link that grants permission when clicked.
  def parent_permission_request(parent_email, permission_url)
    @permission_url = permission_url
    mail from: 'Code.org <noreply@code.org>', to: parent_email, subject: I18n.t('parent_mailer.parent_permission_request_subject')
  end

  # Reminder for parents who haven't granted permission for their child's account.
  def parent_permission_reminder(parent_email, permission_url)
    @permission_url = permission_url
    mail from: 'Code.org <noreply@code.org>', to: parent_email, subject: I18n.t('parent_mailer.parent_permission_reminder_subject')
  end

  # Confirmation sent after a parent has granted permission for their child's code.org account.
  def parent_permission_confirmation(parent_email)
    mail from: 'Code.org <noreply@code.org>', to: parent_email, subject: I18n.t('parent_mailer.parent_permission_confirmation_subject')
  end
end
