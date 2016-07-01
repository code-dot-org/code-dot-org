class Pd::WorkshopMailer < ActionMailer::Base
  SUPPORTED_TECH_URL = 'https://support.code.org/hc/en-us/articles/202591743-What-kind-of-operating-system-and-browser-do-I-need-to-use-Code-org-s-online-learning-system-'

  # Name of partial view for workshop details organized by course, then subject.
  # (views/pd/workshop_mailer/workshop_details/_<name>.html.haml)
  DETAILS_PARTIALS = {
    Pd::Workshop::COURSE_CS_IN_S => {
      Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2 => 'phase_2',
      Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1 => 'cs_in_s_phase_3_semester_1',
      Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2 => 'cs_in_s_phase_3_semester_2'
    },
    Pd::Workshop::COURSE_CS_IN_A => {
      Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2 => 'phase_2',
      Pd::Workshop::SUBJECT_CS_IN_A_PHASE_3 => 'cs_in_a_phase_3'
    },
    Pd::Workshop::COURSE_ECS => {
      Pd::Workshop::SUBJECT_ECS_PHASE_2 => 'phase_2',
      Pd::Workshop::SUBJECT_ECS_UNIT_3 => 'ecs_unit_3',
      Pd::Workshop::SUBJECT_ECS_UNIT_4 => 'ecs_unit_4',
      Pd::Workshop::SUBJECT_ECS_UNIT_5 => 'ecs_unit_5',
      Pd::Workshop::SUBJECT_ECS_UNIT_6 => 'ecs_unit_6',
      Pd::Workshop::SUBJECT_ECS_PHASE_4 => 'ecs_phase_4'
    }
  }

  # Online URL used in the details partials, organized by course.
  ONLINE_URL = {
    Pd::Workshop::COURSE_CS_IN_S => 'https://studio.code.org/s/sciencepd1',
    Pd::Workshop::COURSE_CS_IN_A => 'https://studio.code.org/s/algebrapd1',
    Pd::Workshop::COURSE_ECS => 'https://studio.code.org/s/ecspd1'
  }

  def teacher_enrollment_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code
    @details_partial = get_details_partial @workshop.course, @workshop.subject
    @online_url = ONLINE_URL[@workshop.course]

    mail content_type: 'text/html',
      from: from_teacher,
      subject: 'Your upcoming Code.org workshop and next steps',
      to: email_address(@enrollment.name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def organizer_enrollment_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @teacher_dashboard_url = CDO.code_org_url "/teacher-dashboard#/sections/#{@workshop.section_id}/manage"

    mail content_type: 'text/html',
      from: from_no_reply,
      subject: 'Code.org workshop registration',
      to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def teacher_cancel_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop

    mail content_type: 'text/html',
      from: from_teacher,
      subject: 'Code.org workshop cancellation',
      to: email_address(@enrollment.name, @enrollment.email)
  end

  def organizer_cancel_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop

    mail content_type: 'text/html',
      from: from_no_reply,
      subject: 'Code.org workshop cancellation',
      to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def teacher_enrollment_reminder(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code

    mail content_type: 'text/html',
      from: from_teacher,
      subject: 'Your upcoming Code.org workshop and next steps',
      to: email_address(@enrollment.name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def exit_survey(workshop, teacher, enrollment)
    @workshop = workshop
    @teacher = teacher
    @is_first_workshop = Pd::Workshop.attended_by(teacher).in_state(Pd::Workshop::STATE_ENDED).count == 1

    @survey_url = CDO.code_org_url "/pd-workshop-survey/#{enrollment.code}", 'https:'

    mail content_type: 'text/html',
      from: from_hadi,
      subject: 'How was your Code.org workshop?',
      to: email_address(@teacher.name, @teacher.email)

    attachments['certificate.jpg'] = generate_csf_certificate if @workshop.course == Pd::Workshop::COURSE_CSF
  end

  private

  def generate_csf_certificate
    image = create_certificate_image2(
      dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_csf.png'),
      @teacher.name || @teacher.email,
      y: 444,
      height: 100,
    )
    image.format = 'jpg'
    Base64.encode64(image.to_blob)
  end

  def email_address(display_name, email)
    Mail::Address.new(email).tap do |address|
      address.display_name = display_name
    end.format
  end

  def from_teacher
    email_address('Code.org', 'teacher@code.org')
  end

  def from_no_reply
    email_address('Code.org', 'noreply@code.org')
  end

  def from_hadi
    email_address('Hadi Partovi', 'hadi_partovi@code.org')
  end

  def get_details_partial(course, subject)
    return 'csf' if course == Pd::Workshop::COURSE_CSF
    return DETAILS_PARTIALS[course][subject] if DETAILS_PARTIALS[course] && DETAILS_PARTIALS[course][subject]
    nil
  end
end
