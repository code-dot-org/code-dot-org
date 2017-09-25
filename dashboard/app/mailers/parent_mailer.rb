class ParentMailer < ActionMailer::Base
  default from: 'Hadi Partovi <hadi_partovi@code.org>'

  # Email a parent when a student upgrades to a username/password account by adding a parent email
  def student_associated_with_parent_email(parent_email, student)
    @student = student

    mail to: parent_email, subject: I18n.t('parent_mailer.student_associated_subject')
  end
end
