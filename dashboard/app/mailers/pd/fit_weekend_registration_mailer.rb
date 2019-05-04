class Pd::FitWeekendRegistrationMailer < ActionMailer::Base
  default from: 'Sarah Fairweather <facilitators@code.org>'
  default bcc: MailerConstants::PLC_EMAIL_LOG

  def confirmation(registration)
    @registration = registration

    mail(
      to: registration.pd_application.user.email,
      subject: "We've received your FiT weekend registration form"
    )
  end
end
