# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::TeacherApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def application_receipt
    Pd::TeacherApplicationMailer.application_receipt build_application
  end

  def principal_approval_request_csd
    Pd::TeacherApplicationMailer.principal_approval_request build_application(course: 'csd')
  end

  def principal_approval_request_csp
    Pd::TeacherApplicationMailer.principal_approval_request build_application(course: 'csp')
  end

  def principal_approval_receipt
    Pd::TeacherApplicationMailer.principal_approval_receipt build_application
  end

  private

  def build_application(course: nil)
    # Build user explicitly (instead of create) so it's not saved
    user = build :teacher, email: 'rubeus@hogwarts.co.uk'
    application_hash = build :pd_teacher_application_hash, course: course, school: School.first, user: user
    build :pd_teacher_application, application_hash: application_hash, user: user
  end
end
