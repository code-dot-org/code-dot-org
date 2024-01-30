class LtiMailer < ApplicationMailer
  default from: 'Code.org <noreply@code.org>'

  # Email an LMS admin after they create an LTI integration
  def lti_integration_confirmation(admin_email)
    mail to: admin_email, subject: I18n.t('lti.integration.mailer_confirmation_subject')
  end
end
