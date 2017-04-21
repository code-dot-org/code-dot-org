class Pd::WorkshopEnrollmentController < ApplicationController
  # GET /pd/workshops/1/enroll
  def new
    view_options(no_footer: true)
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
      @account_exists = User.find_by_email_or_hashed_email(
        @enrollment.email
        ).present?
    end
  end

  # GET /pd/workshop_enrollment/:code/cancel
  def cancel
    @enrollment = Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    else
      @enroll_url = url_for action: :new, workshop_id: @enrollment.pd_workshop_id
      @enrollment.destroy!
      Pd::WorkshopMailer.teacher_cancel_receipt(@enrollment).deliver_now
      Pd::WorkshopMailer.organizer_cancel_receipt(@enrollment).deliver_now
    end
  end

  # GET /pd/workshops/join/:section_code
  def join_section
    unless current_user
      redirect_to "/users/sign_in?return_to=#{request.url}"
      return
    end

    @workshop = Pd::Workshop.find_by_section_code(params.require(:section_code))
    unless @workshop
      render_404
      return
    end
    if workshop_closed?
      render :closed
      return
    elsif workshop_owned_by? current_user
      render :own
      return
    end

    @enrollment = get_workshop_user_enrollment
  end

  # POST /pd/workshops/join/:section_code
  # PATCH /pd/workshops/join/:section_code
  def confirm_join
    @workshop = Pd::Workshop.find_by_section_code(params.require(:section_code))
    unless @workshop && current_user
      render_404
      return
    end

    @enrollment = get_workshop_user_enrollment
    @enrollment.assign_attributes enrollment_params.merge(user_id: current_user.id)
    @enrollment.school_info_attributes = school_info_params

    # enrollment.school should never be set when school_info.country is set. Fix this so that the following flow works:
    #   1. user enrolls using the old format (setting enrollment.school but not school_info.country)
    #   2. user joins using the new format (setting school_info.country)
    @enrollment[:school] = nil if @enrollment.school_info.try(:country)

    if @enrollment.valid? && Digest::MD5.hexdigest(@enrollment.email) != current_user.hashed_email
      @enrollment.errors[:email] = "must match your login. If you want to use this email instead, \
        first update it in #{ActionController::Base.helpers.link_to('account settings', '/users/edit')}."
      render :join_section
      return
    end

    if @enrollment.valid? && @enrollment.save
      # Upgrade to teacher and set email in cases where the user email is missing.
      # Note the supplied email must match the user's hashed_email in order to get here. Otherwise it will fail above.
      current_user.update!(user_type: User::TYPE_TEACHER, email: @enrollment.email) if current_user.email.blank?

      @workshop.section.add_student current_user

      # Automatically mark attendance for one-day workshops
      mark_attended(current_user.id, @workshop.sessions.first.id) if @workshop.sessions.count == 1

      redirect_to root_path, notice: I18n.t('follower.registered', section_name: @workshop.section.name)
    else
      render :join_section
    end
  end

  private

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
    @workshop.organizer_id == user.id || @workshop.facilitators.exists?(id: user.id)
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
