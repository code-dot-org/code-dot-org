class Pd::WorkshopMailer < ActionMailer::Base
  SUPPORTED_TECH_URL = 'https://support.code.org/hc/en-us/articles/202591743-What-kind-of-operating-system-and-browser-do-I-need-to-use-Code-org-s-online-learning-system-'.freeze

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

  ONLINE_URL = 'https://studio.code.org/my-professional-learning'

  after_action :save_timestamp

  def teacher_enrollment_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code
    @details_partial = get_details_partial @workshop.course, @workshop.subject
    @online_url = ONLINE_URL

    mail content_type: 'text/html',
      from: from_teacher,
      subject: teacher_enrollment_subject(@workshop),
      to: email_address(@enrollment.full_name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def organizer_enrollment_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop

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
      to: email_address(@enrollment.full_name, @enrollment.email)
  end

  def organizer_cancel_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop

    mail content_type: 'text/html',
      from: from_no_reply,
      subject: 'Code.org workshop cancellation',
      to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def organizer_should_close_reminder(workshop)
    @workshop = workshop

    mail content_type: 'text/html',
      from: from_no_reply,
      subject: "Your #{@workshop.course} workshop is still open, please close it",
      to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def teacher_enrollment_reminder(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code
    @is_reminder = true

    return if @workshop.suppress_reminders?

    mail content_type: 'text/html',
      from: from_teacher,
      subject: teacher_enrollment_subject(@workshop),
      to: email_address(@enrollment.full_name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def facilitator_enrollment_reminder(user, workshop)
    @user = user
    @workshop = workshop
    @cancel_url = '#'
    @is_reminder = true

    return if @workshop.suppress_reminders?

    mail content_type: 'text/html',
         from: from_teacher,
         subject: teacher_enrollment_subject(@workshop),
         to: email_address(@user.name, @user.email),
         reply_to: email_address(@user.name, @user.email)
  end

  def organizer_enrollment_reminder(workshop)
    @workshop = workshop
    @cancel_url = '#'
    @is_reminder = true

    return if @workshop.suppress_reminders?

    mail content_type: 'text/html',
         from: from_teacher,
         subject: teacher_enrollment_subject(@workshop),
         to: email_address(@workshop.organizer.name, @workshop.organizer.email),
         reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def detail_change_notification(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code

    mail content_type: 'text/html',
      from: from_teacher,
      subject: detail_change_notification_subject(@workshop),
      to: email_address(@enrollment.full_name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def facilitator_detail_change_notification(user, workshop)
    @user = user
    @workshop = workshop
    @cancel_url = '#'

    mail content_type: 'text/html',
         from: from_teacher,
         subject: detail_change_notification_subject(@workshop),
         to: email_address(@user.name, @user.email),
         reply_to: email_address(@user.name, @user.email)
  end

  def organizer_detail_change_notification(workshop)
    @workshop = workshop
    @cancel_url = '#'

    mail content_type: 'text/html',
         from: from_teacher,
         subject: detail_change_notification_subject(@workshop),
         to: email_address(@workshop.organizer.name, @workshop.organizer.email),
         reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  # Exit survey email
  # @param enrollment [Pd::Enrollment]
  def exit_survey(enrollment)
    @workshop = enrollment.workshop
    @teacher = enrollment.user
    @enrollment = enrollment
    @survey_url = enrollment.exit_survey_url

    # Don't send if there's no associated survey
    return unless @survey_url

    @dash_code = CDO.pd_workshop_exit_survey_dash_code

    content_type = 'text/html'
    if @workshop.course == Pd::Workshop::COURSE_CSF
      attachments['certificate.jpg'] = generate_csf_certificate
      content_type = 'multipart/mixed'
    end

    mail content_type: content_type,
      from: from_survey,
      subject: 'How was your Code.org workshop?',
      to: email_address(@enrollment.full_name, @enrollment.email)
  end

  private

  def save_timestamp
    return unless @enrollment && @enrollment.persisted?
    Pd::EnrollmentNotification.create(enrollment: @enrollment, name: action_name)
  end

  def generate_csf_certificate
    image = create_certificate_image2(
      dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_csf.png'),
      @enrollment.full_name,
      y: 444,
      height: 100,
    )
    image.format = 'jpg'
    image.to_blob
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

  def from_survey
    email_address('Code.org', 'survey@code.org')
  end

  def get_details_partial(course, subject)
    return 'csf' if course == Pd::Workshop::COURSE_CSF
    return DETAILS_PARTIALS[course][subject] if DETAILS_PARTIALS[course] && DETAILS_PARTIALS[course][subject]
    nil
  end

  def teacher_enrollment_subject(workshop)
    if [Pd::Workshop::COURSE_ADMIN, Pd::Workshop::COURSE_COUNSELOR].include? workshop.course
      "Your upcoming #{workshop.course_name} workshop"
    elsif workshop.local_summer?
      'Your upcoming CS Principles workshop and next steps'
    else
      'Your upcoming Code.org workshop and next steps'
    end
  end

  def detail_change_notification_subject(workshop)
    if [Pd::Workshop::COURSE_ADMIN, Pd::Workshop::COURSE_COUNSELOR].include? workshop.course
      "Details for your upcoming #{workshop.course_name} workshop have changed"
    else
      'Details for your upcoming Code.org workshop have changed'
    end
  end
end
