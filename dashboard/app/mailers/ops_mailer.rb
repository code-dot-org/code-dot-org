class OpsMailer < ActionMailer::Base
  default from: 'noreply@code.org'
  default to: 'ops@code.org'

  def district_contact_added_teachers(district_contact, cohort, added_teachers, removed_teachers)
    @district_contact = district_contact
    @cohort = cohort
    @added_teachers = added_teachers
    @removed_teachers = removed_teachers

    subject = "[ops notification] #{district_contact.ops_first_name} #{district_contact.ops_last_name} modified #{cohort.name}"

    mail content_type: 'text/html', subject: subject
  end

  def script_assigned(params)
    @params = params

    subject = "You have been assigned a new course: #{params[:script].localized_title}"
    mail content_type: 'text/html', subject: subject, to: params[:user].email
  end

  def unexpected_teacher_added(workshop_facilitator, added_teachers, workshop)
    @added_teachers = added_teachers
    @workshop = workshop
    @facilitator = workshop_facilitator

    subject = "[ops notification] #{workshop_facilitator.ops_first_name} #{workshop_facilitator.ops_last_name} has added unexpected teachers to #{workshop.name}"
    mail content_type: 'text/html', subject: subject
  end
end
