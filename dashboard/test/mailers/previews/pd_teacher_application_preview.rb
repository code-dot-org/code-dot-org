# This can be viewed on non-production environments at /rails/mailers/pd/teacher_application_mailer
class Pd::TeacherApplicationMailerPreview < ActionMailer::Preview
  def application_receipt
    Pd::TeacherApplicationMailer.send(
      :application_receipt,
      Pd::TeacherApplication.new(application: {
                                   firstName: "Rubeus",
                                   lastName: "Hagrid",
                                   primaryEmail: "rubeus@hogwarts.co.uk",
                                 }.to_json)
    )
  end

  def principal_approval_request
    Pd::TeacherApplicationMailer.send(
      :principal_approval_request,
      Pd::TeacherApplication.new(application: {
                                   principalPrefix: "Mrs.",
                                   principalFirstName: "Minerva",
                                   principalLastName: "McGonagall",
                                   principalEmail: "minerva@hogwarts.co.uk",
                                   firstName: "Rubeus",
                                   lastName: "Hagrid",
                                   courseSelection: "csd"}.to_json)
    )
  end

  def principal_approval_receipt
    Pd::TeacherApplicationMailer.send(
      :principal_approval_receipt,
      Pd::TeacherApplication.new(application: {
                                   firstName: "Rubeus",
                                   lastName: "Hagrid",
                                   primaryEmail: "rubeus@hogwarts.co.uk",
                                 }.to_json)
    )
  end
end
