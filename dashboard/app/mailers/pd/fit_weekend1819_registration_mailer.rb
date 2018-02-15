class Pd::FitWeekend1819RegistrationMailer < ActionMailer::Base
  default from: 'Sarah Fairweather <facilitator@code.org'

  def confirmation(registration)
    @registration = registration

    mail(
      to: registration.pd_application.user.email,
      subject: "We've received your FiT weekend registration form"
    )
  end
end