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

  def teacher_enrollment_receipt__csf_intro
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101
  end

  def teacher_enrollment_receipt__csf_deepdive
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_201
  end

  def teacher_enrollment_receipt__csd_summer_workshop
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP
  end

  def teacher_enrollment_receipt__csp_summer_workshop
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
  end

  def teacher_enrollment_receipt__csp_1
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
  end

  def teacher_enrollment_receipt_csd_1
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_WORKSHOP_1
  end

  def teacher_enrollment_receipt__admin
    mail :teacher_enrollment_receipt, Pd::Workshop::COURSE_ADMIN
  end

  def teacher_enrollment_receipt__formatted_notes
    notes = <<-NOTES.strip_heredoc
      This is a multi-line, formatted notes section, with preserved whitespace:

      I have skipped lines ^,
      double  spaces,
        and indentation.
    NOTES

    mail :teacher_enrollment_receipt, workshop_params: {notes: notes}
  end

  def teacher_enrollment_reminder__csf_intro_10_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101,
      options: {days_before: 10}
  end

  def teacher_enrollment_reminder__csf_intro_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101,
      options: {days_before: 3}
  end

  def teacher_enrollment_reminder__csf_deepdive_10_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_201,
      options: {days_before: 10}
  end

  def teacher_enrollment_reminder__csf_deepdive_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_201,
      options: {days_before: 3}
  end

  def teacher_enrollment_reminder__csd_summer_workshop_10_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP,
      options: {days_before: 10}
  end

  def teacher_enrollment_reminder__csd_summer_workshop_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP,
      options: {days_before: 3}
  end

  def teacher_enrollment_reminder__csp_summer_workshop_10_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP,
      options: {days_before: 10}
  end

  def teacher_enrollment_reminder__csp_summer_workshop_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP,
      options: {days_before: 3}
  end

  def teacher_enrollment_reminder__csp_1_10_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_WORKSHOP_1,
      options: {days_before: 10}
  end

  def teacher_enrollment_reminder__csp_1_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_WORKSHOP_1,
      options: {days_before: 3}
  end

  def teacher_enrollment_reminder_csd_1_10_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_WORKSHOP_1,
      options: {days_before: 10}
  end

  def teacher_enrollment_reminder_csd_1_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_WORKSHOP_1,
      options: {days_before: 3}
  end

  def teacher_enrollment_reminder_csd_unit_6_3_day
    mail :teacher_enrollment_reminder, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_WORKSHOP_4,
      options: {days_before: 3}
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

  def teacher_follow_up__csf_intro
    mail :teacher_follow_up, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101
  end

  def organizer_enrollment_receipt
    mail :organizer_enrollment_receipt
  end

  def organizer_enrollment_reminder
    mail :organizer_enrollment_reminder, target: :workshop
  end

  def organizer_should_close_reminder
    mail :organizer_should_close_reminder, target: :workshop
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
    mail :organizer_cancel_receipt
  end

  def detail_change_notification__csf_intro
    mail :detail_change_notification, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101
  end

  def detail_change_notification__csf_deepdive
    mail :detail_change_notification, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_201
  end

  def organizer_detail_change_notification__csf
    mail :organizer_detail_change_notification, Pd::Workshop::COURSE_CSF, target: :workshop
  end

  def facilitator_detail_change_notification__csf_intro
    mail :facilitator_detail_change_notification, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101, target: :facilitator
  end

  def detail_change_notification__admin
    mail :detail_change_notification, Pd::Workshop::COURSE_ADMIN
  end

  # Exit survey has variations for CSF and CSP Local Summer. It's the same for all other courses.
  def exit_survey__general
    mail :exit_survey
  end

  def exit_survey__csf_intro
    mail :exit_survey, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_101
  end

  def exit_survey__csf_deepdive
    mail :exit_survey, Pd::Workshop::COURSE_CSF, Pd::Workshop::SUBJECT_CSF_201
  end

  def exit_survey__csp_summer_workshop
    mail :exit_survey, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
  end

  def exit_survey__csd_teacher_con
    mail :exit_survey, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_TEACHER_CON
  end

  def exit_survey__csp_1
    mail :exit_survey, Pd::Workshop::COURSE_CSP, Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
  end

  def exit_survey__csd_1
    mail :exit_survey, Pd::Workshop::COURSE_CSD, Pd::Workshop::SUBJECT_CSD_WORKSHOP_1
  end

  private

  def mail(method, course = nil, subject = nil, options: nil, target: :enrollment, workshop_params: {})
    unless course
      course = DEFAULT_COURSE
      subject = DEFAULT_SUBJECT
    end

    facilitator = build :facilitator, name: 'Fiona Facilitator', email: 'fiona_facilitator@example.net'
    organizer = build :workshop_organizer, name: 'Oscar Organizer', email: 'oscar_organizer@example.net'
    default_workshop_params = {
      organizer: organizer,
      num_sessions: 2,
      course: course,
      subject: subject,
      location_name: 'Code.org office',
      location_address: '1501 4th Ave, Suite 900, Seattle, WA',
      facilitators: [facilitator]
    }
    workshop = build :workshop, default_workshop_params.merge(workshop_params)

    teacher = build :teacher, name: 'Tracy Teacher', email: 'tracy_teacher@example.net'

    school_info = build :school_info

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
