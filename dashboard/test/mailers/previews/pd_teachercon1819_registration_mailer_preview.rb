# This can be viewed on non-production environments at /rails/mailers/pd/teachercon1819_registration_mailer
class Pd::Teachercon1819RegistrationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def accepted
    Pd::Teachercon1819RegistrationMailer.confirmation build_registration(:accepted)
  end

  def withdrawn
    Pd::Teachercon1819RegistrationMailer.confirmation build_registration(:withdrawn)
  end

  def waitlisted
    Pd::Teachercon1819RegistrationMailer.confirmation build_registration(:waitlisted)
  end

  private

  def build_registration(status)
    user = build :teacher, email: 'rubeus@hogwarts.co.uk'

    application_hash = build :pd_teacher1819_application_hash, school: School.first
    application = build :pd_teacher1819_application, user: user, form_data: application_hash.to_json
    workshop = application.find_teachercon_workshop(course: 'CS Discoveries', city: 'Phoenix', year: 2018)
    application.pd_workshop_id = workshop.id

    build :pd_teachercon1819_registration, pd_application: application, hash_trait: status
  end
end
