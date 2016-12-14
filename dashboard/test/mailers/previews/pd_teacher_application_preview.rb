# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::TeacherApplicationMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def application_receipt
    Pd::TeacherApplicationMailer.send(
      :application_receipt,
      "Rubeus Hagrid",
      "rubeus@hogwarts.co.uk"
    )
  end

  def principal_approval_request
    Pd::TeacherApplicationMailer.send(
      :principal_approval_request,
      "Mrs.",
      "Minerva",
      "McGonagall",
      "minerva@hogwarts.co.uk",
      "Rubeus Hagrid",
      "Computer Science Discoveries"
    )
  end

  def principal_approval_receipt
    Pd::TeacherApplicationMailer.send(
      :principal_approval_receipt,
      "Rubeus",
      "Hagrid",
      "rubeus@hogwarts.co.uk",
    )
  end

  private

  def mail(method, application)
    Pd::TeacherApplicationMailer.send(method, application)
  end
end
