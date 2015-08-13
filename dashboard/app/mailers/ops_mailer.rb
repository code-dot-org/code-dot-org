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

  def workshop_in_2_weeks_reminder(workshop, recipient, recipient_ops_data)
    @workshop = workshop
    # program_type was originally stored as a string in the db, but was later changed to an id that maps to activity_constants.
    # The datatype in MySql was never changed, so for now you have to coerce it to an integer
    @workshop[:program_type] = ActivityConstants::PROGRAM_TYPES[workshop[:program_type].to_i]
    @workshop[:phase] = ActivityConstants::PHASES[workshop[:phase]]
    subject = "Important: Your #{@workshop[:phase][:short_name]} workshop is coming up."
    if @workshop[:phase][:prerequisite_phase]
      @workshop[:prerequisite_phase] = ActivityConstants::PHASES[@workshop[:phase][:prerequisite_phase]]
      subject += " Complete #{@workshop[:prerequisite_phase][:short_name]}"
    end
    @recipient = recipient
    @recipient_ops_data = recipient_ops_data

    mail content_type: 'text/html', subject: subject, to: 'andre@code.org'
  end
end
