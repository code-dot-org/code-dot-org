# This is a developer aid that allows previewing rendered mail views with fixed test data.
# The route is restricted so it only exists in development mode.
# See https://github.com/basecamp/mail_view
#
# Ideally, there should be the minimum sufficient previews to cover all unique mail renderings.
# A navigable list of previews is available at /pd/mail_preview/ (on development only)

class Pd::MailPreviewController < MailView
  # Teacher enrollment receipt
  # Each course and subject below have variations in rendering.
  # CSF
  def teacher_enrollment_receipt_csf
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  # CSinA
  def teacher_enrollment_receipt_cs_in_a_phase_2
    workshop = workshop(Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_cs_in_a_phase_3
    workshop = workshop(Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_3)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  # CSinS
  def teacher_enrollment_receipt_cs_in_s_phase_2
    workshop = workshop(Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_cs_in_s_phase_3_semester_1
    workshop = workshop(Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_cs_in_s_phase_3_semester_2
    workshop = workshop(Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  # ECS
  def teacher_enrollment_receipt_ecs_phase_2
    workshop = workshop(Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_ecs_unit_3
    workshop = workshop(Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_3)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_ecs_unit_4
    workshop = workshop(Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_4)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_ecs_unit_5
    workshop = workshop(Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_5)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_ecs_unit_6
    workshop = workshop(Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_6)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_receipt_ecs_phase_4
    workshop = workshop(Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_4)
    Pd::WorkshopMailer.teacher_enrollment_receipt enrollment(workshop)
  end

  def teacher_enrollment_reminder
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.teacher_enrollment_reminder enrollment(workshop)
  end

  # Organizer enrollment receipt
  # This renders the same regardless of course, so the course choice here is arbitrary.
  def organizer_enrollment_receipt
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.organizer_enrollment_receipt enrollment(workshop)
  end

  # Teacher cancel receipt
  # This has a variation for CSF. It's the same for all other courses.
  # CSP
  def teacher_cancel_receipt_general
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.teacher_cancel_receipt enrollment(workshop)
  end

  # CSF
  def teacher_cancel_receipt_csf
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.teacher_cancel_receipt enrollment(workshop)
  end

  # Organizer cancel receipt
  # No rendering variations. Course selection is arbitrary.
  def organizer_cancel_receipt
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.organizer_cancel_receipt enrollment(workshop)
  end

  # Exit survey
  # This has a variation for CSF. It's the same for all other courses.
  def exit_survey_general
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.exit_survey workshop, teacher, enrollment(workshop)
  end

  def exit_survey_csf
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.exit_survey workshop, teacher, enrollment(workshop)
  end

  private

  # Dummy data for testing out the mail view rendering:
  def workshop(course, options = {})
    organizer = User.new name: 'Oscar Organizer', email: 'oscar_organizer@example.net'
    params = {
      course: course,
      organizer: organizer,
      sessions: sessions,
      location_name: 'Code.org office',
      location_address: 'Seattle, WA',
      notes: 'Remember to bring a lunch.'
    }
    Pd::Workshop.new(params.merge(options))
  end

  def sessions
    [
      Pd::Session.new(start: day(1).at(9), end: day(1).at(17)),
      Pd::Session.new(start: day(2).at(10), end: day(1).at(16))
    ]
  end

  def teacher
    User.new(
      name: 'Tracy Teacher',
      email: 'tracy_teacher@example.net'
    )
  end

  def enrollment(workshop)
    Pd::Enrollment.new(
      workshop: workshop,
      name: 'Tracy Teacher',
      email: 'tracy_teacher@example.net',
      school_district: school_district,
      school: 'sample school'
    ).tap(&:assign_code)
  end

  def school_district
    SchoolDistrict.new(
      name: 'sample district'
    )
  end

  def day(d)
    ::Date.today + 1.months + d.days
  end

  class ::Date
    def at(h)
      self + h.hours
    end
  end
end
