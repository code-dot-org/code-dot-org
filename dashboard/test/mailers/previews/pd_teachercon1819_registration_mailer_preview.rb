# This can be viewed on non-production environments at /rails/mailers/pd/teachercon1819_registration_mailer
class Pd::Teachercon1819RegistrationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def accepted
    Pd::Teachercon1819RegistrationMailer.teacher build_teacher_registration(:accepted)
  end

  def withdrawn
    Pd::Teachercon1819RegistrationMailer.teacher build_teacher_registration(:declined)
  end

  def waitlisted
    Pd::Teachercon1819RegistrationMailer.teacher build_teacher_registration(:waitlisted)
  end

  def facilitator_accepted
    Pd::Teachercon1819RegistrationMailer.facilitator build_facilitator_registration(:facilitator_accepted)
  end

  def facilitator_withdrawn
    Pd::Teachercon1819RegistrationMailer.facilitator build_facilitator_registration(:facilitator_declined)
  end

  def regional_partner_accepted
    Pd::Teachercon1819RegistrationMailer.regional_partner build_regional_partner_registration(:partner_accepted)
  end

  def regional_partner_declined
    Pd::Teachercon1819RegistrationMailer.regional_partner build_regional_partner_registration(:partner_declined)
  end

  def lead_facilitator_accepted
    Pd::Teachercon1819RegistrationMailer.lead_facilitator build_lead_facilitator_registration(:lead_facilitator_accepted)
  end

  def lead_facilitator_declined
    Pd::Teachercon1819RegistrationMailer.lead_facilitator build_lead_facilitator_registration(:lead_facilitator_declined)
  end

  private

  def build_teacher_registration(status)
    user = build :teacher, email: 'rubeus@hogwarts.co.uk'

    application_hash = build :pd_teacher1819_application_hash, school: School.first
    application = build :pd_teacher1819_application, user: user, form_data: application_hash.to_json
    workshop = application.find_teachercon_workshop(course: 'CS Discoveries', city: 'Phoenix', year: 2018) ||
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON, processed_location: {city: 'Phoenix'}, num_sessions: 5)
    application.pd_workshop_id = workshop.id

    build :pd_teachercon1819_registration, pd_application: application, hash_trait: status
  end

  def build_facilitator_registration(status)
    user = build :facilitator, email: 'flitwick@hogwarts.co.uk'

    application_hash = build :pd_facilitator1819_application_hash
    application = build :pd_facilitator1819_application, user: user, form_data: application_hash.to_json

    workshop = application.find_teachercon_workshop(course: 'CS Discoveries', city: 'Phoenix', year: 2018) ||
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON, processed_location: {city: 'Phoenix'}, num_sessions: 5)

    application.pd_workshop_id = workshop.id

    build :pd_teachercon1819_registration, pd_application: application, hash_trait: status
  end

  def build_regional_partner_registration(status)
    regional_partner_contact = build :teacher, email: 'dumbledore@hogwarts.co.uk', name: 'Albus Dumbledore'
    regional_partner = build :regional_partner, contact: regional_partner_contact

    build :pd_teachercon1819_registration, pd_application: nil,
      regional_partner: regional_partner, user: regional_partner_contact, hash_trait: status
  end

  def build_lead_facilitator_registration(status)
    user = build :facilitator, email: 'flitwick@hogwarts.co.uk'

    build :pd_teachercon1819_registration, pd_application: nil, regional_partner: nil, user: user,
      hash_trait: status
  end
end
