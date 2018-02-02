class Pd::Teachercon1819RegistrationMailer < ActionMailer::Base
  default from: 'Sarah Fairweather <teacher@code.org>'

  def confirmation(registration)
    @registration = registration

    mail(
      to: registration.pd_application.user.email,
      subject: "We've received your TeacherCon registration form"
    )
  end
end
