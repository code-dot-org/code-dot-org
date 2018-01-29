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
    @user = user
    @added_teachers = added_teachers
    @workshop = workshop

    subject = "[ops notification] #{user.email} has added unexpected teachers to #{workshop.name}"
    mail content_type: 'text/html', subject: subject
  end

  def workshop_reminder(workshop, recipient)
    @workshop = workshop
    @recipient = recipient

    subject = "Important: Your #{@workshop.phase_long_name} workshop is coming up in " \
      "#{(@workshop.segments.first.start.to_date - Date.today).to_i} days".squish
    if @workshop.prerequisite_phase
      subject += ". Complete #{@workshop.prerequisite_phase[:long_name]}"
    end

    mail content_type: 'text/html', subject: subject, to: @recipient.email, from: 'pd@code.org'
  end

  def exit_survey_information(workshop, recipient)
    @workshop = workshop
    @recipient = recipient

    subject = "Feedback requested for your Code.org PD workshop"
    mail content_type: 'text/html', subject: subject, to: @recipient.email, from: 'pd@code.org'
  end
end
