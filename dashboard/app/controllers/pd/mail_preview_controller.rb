class Pd::MailPreviewController < MailView
  # Only in development environments, allows previewing mail rendering with fixed test data

  # Teacher enrollment receipt
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
  def organizer_enrollment_receipt
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.organizer_enrollment_receipt enrollment(workshop)
  end

  # Teacher cancel receipt
  # csf
  def teacher_cancel_receipt_csf
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.teacher_cancel_receipt enrollment(workshop)
  end

  # csf
  def teacher_cancel_receipt_other
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.teacher_cancel_receipt enrollment(workshop)
  end

  # Organizer cancel receipt
  def organizer_cancel_receipt
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.organizer_cancel_receipt enrollment(workshop)
  end

  # Exit survey
  def exit_survey_csf
    workshop = workshop(Pd::Workshop::COURSE_CSF)
    Pd::WorkshopMailer.exit_survey workshop, teacher, enrollment(workshop)
  end

  def exit_survey_other
    workshop = workshop(Pd::Workshop::COURSE_CSP)
    Pd::WorkshopMailer.exit_survey workshop, teacher, enrollment(workshop)
  end

  private

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
      district_name: 'Seattle Public Schools',
      school: 'Code.org school.'
    ).tap(&:assign_code)
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
