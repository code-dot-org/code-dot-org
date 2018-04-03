class Pd::WorkshopEnrollmentController < ApplicationController
  authorize_resource class: 'Pd::Enrollment', only: [:join_session, :confirm_join_session]
  load_and_authorize_resource :session, class: 'Pd::Session', find_by: :code, id_param: :session_code,
    only: [:join_session, :confirm_join_session]
  load_resource :workshop, class: 'Pd::Workshop', through: :session, singleton: true,
    only: [:join_session, :confirm_join_session]

  # GET /pd/workshops/1/enroll
  def new
    view_options(no_footer: true, answerdash: true)
    @workshop = ::Pd::Workshop.find_by_id params[:workshop_id]

    if @workshop.nil?
      render_404
    elsif workshop_closed?
      render :closed
    elsif workshop_full?
      render :full
    else
      @enrollment = ::Pd::Enrollment.new workshop: @workshop
      if current_user
        @enrollment.full_name = current_user.name
        @enrollment.email = current_user.email
        @enrollment.email_confirmation = current_user.email
      end
    end
  end

  # POST /pd/workshops/1/enroll
  def create
    @workshop = ::Pd::Workshop.find_by_id params[:workshop_id]
    if @workshop.nil?
      render_404
      return
    end

    enrollment_email = enrollment_params[:email]
    user = User.find_by_email_or_hashed_email enrollment_email

    # See if a previous enrollment exists for this email
    previous_enrollment = @workshop.enrollments.find_by(email: enrollment_email)
    if previous_enrollment
      @cancel_url = url_for action: :cancel, code: previous_enrollment.code
      render :duplicate
    elsif workshop_owned_by? user
      render :own
    elsif workshop_closed?
      render :closed
    elsif workshop_full?
      render :full
    else
      @enrollment = ::Pd::Enrollment.new workshop: @workshop

      @enrollment.school_info_attributes = school_info_params

      if @enrollment.update enrollment_params
        Pd::WorkshopMailer.teacher_enrollment_receipt(@enrollment).deliver_now
        Pd::WorkshopMailer.organizer_enrollment_receipt(@enrollment).deliver_now
        redirect_to action: :thanks, code: @enrollment.code, controller: 'pd/workshop_enrollment'
      else
        render :new
      end
    end
  end

  # GET /pd/workshop_enrollment/:code
  def show
    @enrollment = ::Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    else
      @cancel_url = url_for action: :cancel, code: @enrollment.code
      @workshop = @enrollment.workshop
    end
  end

  def thanks
    @enrollment = ::Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    else
      @cancel_url = url_for action: :cancel, code: @enrollment.code
      @account_exists = @enrollment.resolve_user.present?
    end
  end

  # GET /pd/workshop_enrollment/:code/cancel
  def cancel
    @enrollment = Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    elsif @enrollment.attendances.any?
      return render :attended
    else
      @enroll_url = url_for action: :new, workshop_id: @enrollment.pd_workshop_id
      @enrollment.destroy!
      Pd::WorkshopMailer.teacher_cancel_receipt(@enrollment).deliver_now
      Pd::WorkshopMailer.organizer_cancel_receipt(@enrollment).deliver_now
    end
  end

  # GET /pd/attend/:session_code/join
  def join_session
    @enrollment = get_workshop_user_enrollment
  end

  # POST /pd/attend/:session_code/join
  def confirm_join_session
    @enrollment = build_enrollment_from_params

    unless @enrollment.save
      render :join_session
      return
    end

    if current_user.student?
      if User.hash_email(@enrollment.email) == current_user.hashed_email
        # Email matches user's hashed email. Upgrade to teacher and set email.
        current_user.update!(user_type: User::TYPE_TEACHER, email: @enrollment.email)
      else
        # No email match. Redirect to upgrade page.
        redirect_to controller: 'pd/session_attendance', action: 'upgrade_account'
        return
      end
    end

    redirect_to controller: 'pd/session_attendance', action: 'attend'
  end

  private

  def build_enrollment_from_params
    enrollment = get_workshop_user_enrollment
    enrollment.assign_attributes enrollment_params.merge(user_id: current_user.id)
    enrollment.school_info_attributes = school_info_params

    enrollment
  end

  def mark_attended(user_id, session_id)
    Pd::Attendance.find_or_create_by!(teacher_id: user_id, pd_session_id: session_id)
  end

  def workshop_closed?
    @workshop.state == ::Pd::Workshop::STATE_ENDED
  end

  def workshop_full?
    @workshop.enrollments.count >= @workshop.capacity
  end

  def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_or_facilitator? user
  end

  # Gets the workshop enrollment associated with the current user id or email if one exists.
  # Otherwise returns a new enrollment for that user.
  def get_workshop_user_enrollment
    @workshop.enrollments.where(
      'user_id = ? OR email = ?', current_user.id, current_user.email
    ).first || Pd::Enrollment.new(
      pd_workshop_id: @workshop.id,
      user_id: current_user.id,
      full_name: current_user.name,
      email: current_user.email
    )
  end

  def enrollment_params
    params.require(:pd_enrollment).permit(
      :first_name,
      :last_name,
      :email,
      :email_confirmation,
      :school
    )
  end

  def school_info_params
    params.require(:school_info).permit(
      :country,
      :school_type,
      :school_state,
      :school_zip,
      :school_district_id,
      :school_district_other,
      :school_district_name,
      :school_id,
      :school_other,
      :school_name,
      :full_address,
    )
  end
end
