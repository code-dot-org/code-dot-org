class Pd::FitWeekend1819RegistrationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def confirmation_accept
    Pd::FitWeekend1819RegistrationMailer.confirmation build_registration(:accepted)
  end

  def confirmation_decline
    Pd::FitWeekend1819RegistrationMailer.confirmation build_registration(:declined)
  end

  private

  def build_registration(status)
    user = build :teacher, email: 'facilitator@code.org'
    application = build :pd_facilitator1819_application, user: user

    workshop = application.find_fit_workshop(course: 'CS Discoveries', city: 'Phoenix', year: 2018)
    application.fit_workshop_id = workshop.id

    build :pd_fit_weekend1819_registration, pd_application: application, status: status
  end
end
