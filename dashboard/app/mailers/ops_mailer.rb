require_relative '../../../lib/cdo/activity_constants'

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

  def unexpected_teacher_added(user, added_teachers, workshop)
    @added_teachers = added_teachers
    @workshop = workshop
    @user = user

    subject = "[ops notification] #{user.email} has added unexpected teachers to #{workshop.name}"
    mail content_type: 'text/html', subject: subject
  end

  def workshop_reminder(workshop, recipient)
    @workshop = workshop
    @recipient = recipient

    subject = "Important: Your #{@workshop.phase_info[:short_name]} workshop is coming up."
    if @workshop.phase_info[:prerequisite_phase]
      @prerequisite_phase = ActivityConstants::PHASES[@workshop.phase_info[:prerequisite_phase]]
      subject += "Complete #{@prerequisite_phase[:short_name]}"
    end

    mail content_type: 'text/html', subject: subject, to: 'andre@code.org', from: 'pd@code.org'
  end

  def exit_survey_information(workshop, recipient)
    @workshop = workshop
    @recipient = recipient

    subject = "Feedback requested for your Code.org PD workshop"
    mail content_type: 'text/html', subject: subject, to: 'andre@code.org', from: 'pd@code.org'
  end
end
