class Pd::WorkshopMailer < ActionMailer::Base
  default from: 'noreply@code.org'

  SUPPORTED_TECH_URL = 'https://support.code.org/hc/en-us/articles/202591743-What-kind-of-operating-system-and-browser-do-I-need-to-use-Code-org-s-online-learning-system-'

  def teacher_enrollment_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code

    mail content_type: 'text/html',
      subject: 'Your upcoming Code.org workshop and next steps.',
      to: email_address(@enrollment.name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  def organizer_enrollment_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @teacher_dashboard_url = CDO.code_org_url "/teacher-dashboard#/sections/#{@workshop.section_id}/manage"

    mail content_type: 'text/html',
      subject: 'Code.org workshop registration.',
      to: email_address(@workshop.organizer.name, @workshop.organizer.email),
      reply_to: 'noreply@code.org'
  end

  def teacher_cancel_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop

    mail content_type: 'text/html',
      subject: 'Code.org workshop cancellation.',
      to: email_address(@enrollment.name, @enrollment.email),
      reply_to: 'noreply@code.org'
  end

  def organizer_cancel_receipt(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop

    mail content_type: 'text/html',
      subject: 'Code.org workshop cancellation.',
      to: email_address(@workshop.organizer.name, @workshop.organizer.email),
      reply_to: 'noreply@code.org'
  end

  def teacher_enrollment_reminder(enrollment)
    @enrollment = enrollment
    @workshop = enrollment.workshop
    @cancel_url = url_for controller: 'pd/workshop_enrollment', action: :cancel, code: enrollment.code

    mail content_type: 'text/html',
      subject: 'Your upcoming Code.org workshop and next steps.',
      to: email_address(@enrollment.name, @enrollment.email),
      reply_to: email_address(@workshop.organizer.name, @workshop.organizer.email)
  end

  # TODO: Make sure every teacher has an enrollment
  def exit_survey(workshop, teacher, enrollment)
    @workshop = workshop
    @teacher = teacher
    @is_first_workshop = Pd::Workshop.attended_by(teacher).in_state(Pd::Workshop::STATE_ENDED).count == 1

    @survey_url = CDO.code_org_url "/pd-workshop-survey/#{enrollment.code}"

    mail content_type: 'text/html',
      subject: 'How was your Code.org workshop?',
      to: email_address(@teacher.name, @teacher.email),
      reply_to: email_address('Hadi Partovi', 'hadi_partovi@code.org')
  end

  private

  def email_address(display_name, email)
    Mail::Address.new(email).tap do |address|
      address.display_name = display_name
    end.format
  end
end
