class OpsMailer < ActionMailer::Base
  default from: 'noreply@code.org'
  default to: 'ops@code.org'

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.ops.district_contact_added_teachers.subject
  #

  def district_contact_added_teachers(district_contact, cohort, added_teachers, removed_teachers)
    @district_contact = district_contact
    @cohort = cohort
    @added_teachers = added_teachers
    @removed_teachers = removed_teachers

    subject = "[ops notification] #{district_contact.ops_first_name} #{district_contact.ops_last_name} modified #{cohort.name}"

    mail content_type: 'text/html', subject: subject
  end
end
