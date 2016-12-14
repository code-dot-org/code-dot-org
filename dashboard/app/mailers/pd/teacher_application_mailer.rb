# coding: utf-8
class Pd::TeacherApplicationMailer < ActionMailer::Base
  default content_type: 'text/html'

  def application_receipt(
        teacher_name:,
        teacher_email:
      )
    mail from: from_teacher,
      subject: 'Your application has been received',
      to: email_address(teacher_name, teacher_email)
  end

  def principal_approval_request(
        principal_prefix:,
        principal_first_name:,
        principal_last_name:,
        principal_email:,
        approval_form_url:,
        teacher_name:,
        program_name:,
        program_url:
      )
    @principal_prefix = principal_prefix
    @principal_last_name = principal_last_name
    @approval_form_url = approval_form_url
    @teacher_name = teacher_name
    @program_name = program_name
    @program_url = program_url
    mail from: from_teacher,
      subject: "Approval requested: #{@teacher_name}’s participation in Code.org Professional Learning Program",
      to: email_address("#{principal_first_name} #{principal_last_name}", principal_email)
  end

  def principal_approval_receipt(
        teacher_first_name:,
        teacher_last_name:,
        teacher_email:
      )
    @teacher_first_name = teacher_first_name
    mail from: from_teacher,
      subject: "We've received your principal's approval form",
      to: email_address("#{teacher_first_name} #{teacher_last_name}", teacher_email)
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
