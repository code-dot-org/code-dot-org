class Pd::TeacherApplicationMailer < ActionMailer::Base
  PRINCIPAL_APPROVAL_DUE_DATE_BY_COURSE = {
    Pd::Workshop::COURSE_CSP => 'May 5, 2017',
    Pd::Workshop::COURSE_CSD => 'April 17, 2017',
  }

  default content_type: 'text/html'

  def application_receipt(teacher_application)
    mail from: from_teacher,
      subject: 'Your application has been received',
      to: email_address(teacher_application.teacher_name, teacher_application.primary_email)
  end

  def principal_approval_request(teacher_application)
    @principal_prefix = teacher_application.principal_prefix
    @principal_last_name = teacher_application.principal_last_name
    @approval_form_url = teacher_application.approval_form_url
    @teacher_name = teacher_application.teacher_name
    @program_name = teacher_application.program_name
    @program_url = teacher_application.program_url
    @due_date = PRINCIPAL_APPROVAL_DUE_DATE_BY_COURSE[@program_name] || raise("Unexpected program #{program_name}")

    mail from: from_teacher,
      subject: "Approval requested: #{@teacher_name}’s participation in Code.org Professional Learning Program",
      to: email_address(teacher_application.principal_name, teacher_application.principal_email)
  end

  def principal_approval_receipt(teacher_application)
    @teacher_first_name = teacher_application.teacher_first_name
    mail from: from_teacher,
      subject: "We've received your principal's approval form",
      to: email_address(teacher_application.teacher_name, teacher_application.primary_email)
  end

  private

  def email_address(display_name, email)
    Mail::Address.new(email).tap do |address|
      address.display_name = display_name
    end.format
  end

  def from_teacher
    email_address('Code.org', 'teacher@code.org')
  end
end
