class Pd::FitWeekendRegistrationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def confirmation_accept
    Pd::FitWeekendRegistrationMailer.confirmation build_registration(:accepted)
  end

  def confirmation_decline
    Pd::FitWeekendRegistrationMailer.confirmation build_registration(:declined)
  end

  private

  def build_registration(status)
    user = build :teacher, email: 'facilitator_name@code.org'
    application = build :pd_facilitator1920_application, user: user

    workshop = application.find_fit_workshop(course: Pd::Workshop::COURSE_CSD, city: 'Phoenix', year: 2019) ||
      create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON, processed_location: {city: 'Phoenix'}, num_sessions: 5)

    application.fit_workshop_id = workshop.id

    build :pd_fit_weekend1920_registration, pd_application: application, status: status
  end
end
