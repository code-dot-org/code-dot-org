# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::TeacherApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def application_receipt
    Pd::TeacherApplicationMailer.application_receipt build(:pd_teacher_application)
  end

  def principal_approval_request
    Pd::TeacherApplicationMailer.principal_approval_request build(:pd_teacher_application)
  end

  def principal_approval_receipt
    Pd::TeacherApplicationMailer.principal_approval_receipt build(:pd_teacher_application)
  end
end
