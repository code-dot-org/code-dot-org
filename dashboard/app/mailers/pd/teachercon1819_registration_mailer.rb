class Pd::Teachercon1819RegistrationMailer < ActionMailer::Base
  default from: 'Sarah Fairweather <teacher@code.org>'

  def teacher(registration)
    @registration = registration

    mail(
      to: registration.pd_application.user.email,
      subject: "We've received your TeacherCon registration form"
    )
  end

  def facilitator(registration)
    @registration = registration

    mail(
      to: registration.pd_application.user.email,
      from: 'Sarah Fairweather <facilitators@code.org>',
      subject: "We've received your TeacherCon registration form"
    )
  end

  def regional_partner(registration)
    @registration = registration

    mail(
      to: registration.user.email,
      subject: "We've received your TeacherCon registration form"
    )
  end
end
