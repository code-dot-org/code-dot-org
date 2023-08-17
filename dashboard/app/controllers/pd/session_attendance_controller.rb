class Pd::SessionAttendanceController < ApplicationController
  load_and_authorize_resource :session, class: 'Pd::Session', id_param: :session_code, find_by: :code
  rescue_from ActiveRecord::RecordNotFound do
    render :not_found, status: :not_found
  end

  # GET pd/attend/:session_code
  def attend
    if @session.workshop.organizer_or_facilitator? current_user
      render_own_workshop
      return
    elsif @session.too_soon_for_attendance?
      render :too_soon
      return
    elsif @session.too_late_for_attendance?
      render :too_late
      return
    end

    enrollments = @session.workshop.enrollments
    enrollment = enrollments.find_by(user: current_user) || enrollments.find_by(email: current_user.email)

    unless enrollment
      # If signed out, user must sign in then is redirected back. If signed in to an account not associated
      # with an enrollment in this workshop, user must switch to an account enrolled in this workshop.
      if current_user
        @safe_names = @session.workshop.unattended_enrollments.get_safe_names
        render :no_enrollment_match
        return
      else
        redirect_to "/users/sign_in?user_return_to=/pd/attend/#{@session.code}"
      end
    end

    attendance = Pd::Attendance.find_restore_or_create_by! session: @session, teacher: current_user
    attendance.update! marked_by_user: nil, enrollment: enrollment
    render :attendance_recorded
  end

  # POST pd/attend/:session_code
  def select_enrollment
    enrollment_code = params.require(:enrollment_code)

    enrollment = Pd::Enrollment.find_by(code: enrollment_code)
    if enrollment.nil? || Pd::Attendance.for_workshop(@session.workshop).exists?(enrollment: enrollment)
      # This has already been claimed
      flash[:error] = "#{params[:safe_name] || 'This name'} has been claimed. Please look again."
      redirect_to action: :attend, session_code: @session.code
      return
    end

    enrollment.update!(user: current_user)

    attendance = Pd::Attendance.find_restore_or_create_by! session: @session, teacher: current_user
    attendance.update! marked_by_user: nil, enrollment: enrollment

    if current_user.student?
      if User.hash_email(enrollment.email) == current_user.hashed_email
        # Email matches user's hashed email. Upgrade to teacher and set email.
        current_user.upgrade_to_teacher(enrollment.email)
      else
        # No email match. Redirect to upgrade page.
        redirect_to action: 'upgrade_account'
        return
      end
    end

    render :attendance_recorded
  end

  # GET /pd/attend/:session_code/upgrade
  def upgrade_account
    redirect_to action: :attend if current_user.teacher?
  end

  # POST /pd/attend/:session_code/upgrade
  def confirm_upgrade_account
    @email = params[:email]
    if User.hash_email(@email) != current_user.hashed_email
      @email_mismatch = true
      render :upgrade_account
      return
    end

    current_user.upgrade_to_teacher(@email)
    redirect_to action: :attend
  end

  private def render_own_workshop
    attend_url = CDO.code_org_url "/pd/#{@session.code}", CDO.default_scheme

    flash[:notice] = "You can't attend this workshop because you organized it. " \
      "If your attendees go to the link #{attend_url} they will see a success message here."

    redirect_to CDO.studio_url('/', CDO.default_scheme)
  end
end
