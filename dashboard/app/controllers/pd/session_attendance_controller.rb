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
      @safe_names = @session.workshop.unattended_enrollments.get_safe_names
      render :match_registration
      return
    end

    attendance = Pd::Attendance.find_restore_or_create_by! session: @session, teacher: current_user
    attendance.update! marked_by_user: nil, enrollment: enrollment
    render_confirmation
  end

  # POST pd/attend/:session_code
  def select_enrollment
    enrollment_code = params.require(:enrollment_code)

    enrollment = Pd::Enrollment.find_by(code: enrollment_code)
    if enrollment.nil? || Pd::Attendance.for_workshop(@session.workshop).where(enrollment: enrollment).exists?
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
        current_user.update!(user_type: User::TYPE_TEACHER, email: enrollment.email)
      else
        # No email match. Redirect to upgrade page.
        redirect_to action: 'upgrade_account'
        return
      end
    end

    render_confirmation
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

    current_user.update!(user_type: User::TYPE_TEACHER, email: @email)
    redirect_to action: :attend
  end

  private

  def render_own_workshop
    attend_url = CDO.code_org_url "/pd/#{@session.code}", CDO.default_scheme

    flash[:notice] = "You can't attend this workshop because you organized it. "\
      "If your attendees go to the link #{attend_url} they will see a success message here."

    redirect_to CDO.studio_url('/', CDO.default_scheme)
  end

  def render_confirmation
    flash[:notice] = 'Thank you for attending Code.org professional development. '\
      "We’ve recorded that you were here on #{@session.formatted_date}. "\
      'If your workshop is multiple days, you will mark yourself as attended each day of the workshop'

    redirect_to CDO.studio_url('/', CDO.default_scheme)
  end
end
