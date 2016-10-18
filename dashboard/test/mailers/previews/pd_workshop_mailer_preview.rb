class Pd::WorkshopMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  DEFAULT_COURSE = Pd::Workshop::COURSE_ECS
  DEFAULT_SUBJECT = Pd::Workshop::SUBJECT_ECS_PHASE_2

  # Dynamically define teacher_enrollment_receipt methods with all available partials
  Pd::WorkshopMailer::DETAILS_PARTIALS.each do |course, partials_by_subject|
    partials_by_subject.each do |subject, partial|
      define_method("teacher_enrollment_receipt__#{partial}") do
        mail :teacher_enrollment_receipt, course, subject
      end
    end
  end

  def teacher_enrollment_receipt__csf
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSF
  end

  def teacher_enrollment_receipt__admin
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_ADMIN
  end

  def teacher_enrollment_reminder__admin
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_ADMIN
  end

  def teacher_enrollment_receipt__counselor
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_COUNSELOR
  end

  def teacher_enrollment_reminder__counselor
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_COUNSELOR
  end

  def organizer_enrollment_receipt
    mail :organizer_enrollment_receipt
  end

  # The teacher_cancel_receipt has a variation for CSF. It's the same for all other courses.
  def teacher_cancel_receipt__general
    mail :teacher_cancel_receipt
  end

  def teacher_cancel_receipt__csf
    mail :teacher_cancel_receipt, Pd::Workshop::COURSE_CSF
  end

  def organizer_cancel_receipt
    mail :teacher_cancel_receipt
  end

  def detail_change_notification__csf
    mail :detail_change_notification, Pd::Workshop::COURSE_CSF
  end

  def detail_change_notification__admin
    mail :detail_change_notification, Pd::Workshop::COURSE_ADMIN
  end

  # Exit survey has a variation for CSF. It's the same for all other courses.
  def exit_survey__general
    mail :exit_survey
  end

  def exit_survey__csf
    mail :exit_survey, Pd::Workshop::COURSE_CSF
  end

  private

  def mail(method, course = nil, subject = nil)
    unless course
      course = DEFAULT_COURSE
      subject = DEFAULT_SUBJECT
    end

    organizer = build :workshop_organizer, name: 'Oscar Organizer', email: 'oscar_organizer@example.net'
    workshop = build :pd_workshop, organizer: organizer, num_sessions: 2, course: course, subject: subject,
      location_name: 'Code.org office', location_address: '1501 4th Ave, Suite 900, Seattle, WA'

    teacher = build :teacher, name: 'Tracy Teacher', email: 'tracy_teacher@example.net'

    #Seattle Public Schools (NCES Id 5307710)
    school_info = build :school_info, school_district: SchoolDistrict.find(5_307_710)

    enrollment = build :pd_enrollment, workshop: workshop, name: teacher.name, email: teacher.email, user: teacher,
      school_info: school_info

    enrollment.assign_code

    Pd::WorkshopMailer.send(method, enrollment)
  end
end
