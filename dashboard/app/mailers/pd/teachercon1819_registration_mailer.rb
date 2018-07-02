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
    email = registration.user.email
    @location_city =
      if registration.pd_application_id?
        @registration.pd_application.workshop.location_city
      else
        @registration.sanitize_form_data_hash[:city]
      end

    mail(
      to: email,
      from: 'Sarah Fairweather <facilitators@code.org>',
      subject: "We've received your TeacherCon registration form"
    )
  end

  def regional_partner(registration)
    @registration = registration

    mail(
      to: registration.sanitize_form_data_hash[:email],
      subject: "We've received your TeacherCon registration form"
    )
  end

  def lead_facilitator(registration)
    @registration = registration

    mail(
      to: registration.user.email,
      from: 'Sarah Fairweather <facilitators@code.org>',
      subject: "We've received your TeacherCon registration form"
    )
  end
end
