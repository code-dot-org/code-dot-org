# This can be viewed on non-production environments at /rails/mailers/pd/workshop_mailer
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

  def organizer_enrollment_reminder
    mail :organizer_enrollment_reminder, target: :workshop
  end

  def facilitator_enrollment_reminder
    mail :facilitator_enrollment_reminder, target: :facilitator
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

  def organizer_detail_change_notification__csf
    mail :organizer_detail_change_notification, Pd::Workshop::COURSE_CSF, target: :workshop
  end

  def facilitator_detail_change_notification__csf
    mail :facilitator_detail_change_notification, Pd::Workshop::COURSE_CSF, target: :facilitator
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

  def mail(method, course = nil, subject = nil, options: nil, target: :enrollment)
    unless course
      course = DEFAULT_COURSE
      subject = DEFAULT_SUBJECT
    end

    facilitator = build :facilitator, name: 'Fiona Facilitator', email: 'fiona_facilitator@example.net'
    organizer = build :workshop_organizer, name: 'Oscar Organizer', email: 'oscar_organizer@example.net'
    workshop = build :pd_workshop, organizer: organizer, num_sessions: 2, course: course, subject: subject,
      location_name: 'Code.org office', location_address: '1501 4th Ave, Suite 900, Seattle, WA',
      facilitators: [facilitator]

    teacher = build :teacher, name: 'Tracy Teacher', email: 'tracy_teacher@example.net'

    school_info = build :school_info_without_country, school_district: SchoolDistrict.first

    enrollment = build :pd_enrollment, workshop: workshop, full_name: teacher.name, email: teacher.email, user: teacher,
      school_info: school_info

    enrollment.assign_code

    case target
      when :enrollment
        if options
          Pd::WorkshopMailer.send(method, enrollment, options)
        else
          Pd::WorkshopMailer.send(method, enrollment)
        end
      when :workshop
        Pd::WorkshopMailer.send(method, workshop)
      when :facilitator
        Pd::WorkshopMailer.send(method, facilitator, workshop)
      else
        raise "unknown target"
    end
  end
end
