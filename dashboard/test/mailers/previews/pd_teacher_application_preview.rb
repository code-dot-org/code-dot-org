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
      "https://www.google.com/url?q=https://docs.google.com/forms/d/e/1FAIpQLScVReYg18EYXvOFN2mQkDpDFgoVqKVv0bWOSE1LFSY34kyEHQ/viewform?entry.1124819666%3DTEACHER%2BNAME%26entry.1772278630%3DSCHOOL%2BNAME%26entry.1885703098%26entry.1693544%26entry.164045958%26entry.2063346846%3DAPPLICATION%2BID&sa=D&ust=1481731427499000&usg=AFQjCNEaaz0F4Z29N64LiCxkUwHudH5gig",
      "Rubeus Hagrid",
      "CS Discoveries",
      "https://code.org/educate/professional-learning/cs-discoveries"
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
