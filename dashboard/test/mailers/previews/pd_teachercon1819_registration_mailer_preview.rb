# This can be viewed on non-production environments at /rails/mailers/pd/teachercon1819_registration_mailer
class Pd::Teachercon1819RegistrationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def accepted
    Pd::Teachercon1819RegistrationMailer.teacher build_teacher_registration(:accepted)
  end

  def withdrawn
    Pd::Teachercon1819RegistrationMailer.teacher build_teacher_registration(:withdrawn)
  end

  def waitlisted
    Pd::Teachercon1819RegistrationMailer.teacher build_teacher_registration(:waitlisted)
  end

  def facilitator_accepted
    Pd::Teachercon1819RegistrationMailer.facilitator build_facilitator_registration(:accepted)
  end

  def facilitator_withdrawn
    Pd::Teachercon1819RegistrationMailer.facilitator build_facilitator_registration(:withdrawn)
  end

  def regional_partner
    Pd::Teachercon1819RegistrationMailer.regional_partner build_regional_partner_registration
  end

  private

  def build_teacher_registration(status)
    user = build :teacher, email: 'rubeus@hogwarts.co.uk'

    application_hash = build :pd_teacher1819_application_hash, school: School.first
    application = build :pd_teacher1819_application, user: user, form_data: application_hash.to_json
    workshop = application.find_teachercon_workshop(course: 'CS Discoveries', city: 'Phoenix', year: 2018)
    application.pd_workshop_id = workshop.id

    build :pd_teachercon1819_registration, pd_application: application, hash_trait: status
  end

  def build_facilitator_registration(status)
    user = build :facilitator, email: 'flitwick@hogwarts.co.uk'

    application_hash = build :pd_facilitator1819_application_hash
    application = build :pd_facilitator1819_application, user: user, form_data: application_hash.to_json

    workshop = application.find_teachercon_workshop(course: 'CS Discoveries', city: 'Phoenix', year: 2018)
    application.pd_workshop_id = workshop.id

    build :pd_teachercon1819_registration, pd_application: application, hash_trait: status
  end

  def build_regional_partner_registration
    regional_partner_contact = build :teacher, email: 'dumbledore@hogwarts.co.uk'
    regional_partner = build :regional_partner, contact: regional_partner_contact

    build :pd_regional_partner_program_registration, regional_partner: regional_partner, user: regional_partner_contact
  end
end
