class Pd::WorkshopEnrollmentController < ApplicationController
  authorize_resource class: 'Pd::Enrollment', only: [:join_session, :confirm_join_session]
  load_and_authorize_resource :session, class: 'Pd::Session', find_by: :code, id_param: :session_code,
    only: [:join_session, :confirm_join_session]
  load_resource :workshop, class: 'Pd::Workshop', through: :session, singleton: true,
    only: [:join_session, :confirm_join_session]

  # GET /pd/workshops/1/join
  # This is for users who have registered for an external workshop. They'll receive a link to complete their
  # enrollment in our system via this join workshop page.
  def join
    @workshop = ::Pd::Workshop.find_by_id params[:workshop_id]

    if !current_user || current_user.user_type == 'student'
      source_page = ERB::Util.url_encode('workshop join')
      return_to = ERB::Util.url_encode("/pd/workshops/#{@workshop.id}/join")
      page_type = current_user ? "teacher_account_required" : "logged_out"

      redirect_to "/#{page_type}?source_page=#{source_page}&return_to=#{return_to}"
    else
      enroll_status =
        if @workshop.nil?
          "not found"
        elsif @workshop.state == ::Pd::Workshop::STATE_ENDED
          "closed"
        elsif @workshop.enrollments.count >= @workshop.capacity
          "full"
        elsif @workshop.organizer_or_facilitator? current_user
          "own"
        elsif @workshop.enrollments.any? {|enrollment| enrollment.user_id == current_user.id}
          "duplicate"
        else
          "unsubmitted"
        end

      view_options(full_width: true, responsive_content: true, no_padding_container: true)
      @script_data = {
        props: {
          workshop_enrollment_status: enroll_status,
          workshop_info: @workshop&.summarize_for_marketing_page,
          user_info: current_user&.summarize_for_workshop
        }.to_json
      }
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

  # GET /pd/workshop_enrollment/:code/cancel
  def cancel
    @enrollment = Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render :not_found
    elsif @enrollment.attendances.any?
      render :attended
    else
      @script_data = {
        props: {
          enrollmentCode: @enrollment.code,
          workshopFriendlyName: @enrollment.workshop.friendly_name
        }.to_json
      }
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
        Services::User::UpgradeToTeacher.call(user: current_user, email: @enrollment.email)
      else
        # No email match. Redirect to upgrade page.
        redirect_to controller: 'pd/session_attendance', action: 'upgrade_account'
        return
      end
    end

    redirect_to controller: 'pd/session_attendance', action: 'attend'
  end

  private def build_enrollment_from_params
    enrollment = get_workshop_user_enrollment
    enrollment.assign_attributes enrollment_params.merge(user_id: current_user.id)
    enrollment.school_info_attributes = school_info_params

    enrollment
  end

  private def mark_attended(user_id, session_id)
    Pd::Attendance.find_or_create_by!(teacher_id: user_id, pd_session_id: session_id)
  end

  private def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_or_facilitator? user
  end

  # Gets the workshop enrollment associated with the current user id or email used for
  # enrollments if one exists. Otherwise returns a new enrollment for that user.
  private def get_workshop_user_enrollment
    enrollment_by_user_id = @workshop.enrollments.where(user_id: current_user.id).first
    return enrollment_by_user_id if enrollment_by_user_id.present?

    enrollment_by_email = @workshop.enrollments.where(email: current_user.email).first
    return enrollment_by_email if enrollment_by_email.present?

    enrollment_by_alternate_email = @workshop.enrollments.where(email: current_user.alternate_email).first
    return enrollment_by_alternate_email if enrollment_by_alternate_email.present?

    Pd::Enrollment.new(
      pd_workshop_id: @workshop.id,
      user_id: current_user.id,
      full_name: current_user.name,
      email: current_user.email
    )
  end

  private def enrollment_params
    params.require(:pd_enrollment).permit(
      :first_name,
      :last_name,
      :email,
      :email_confirmation,
      :school
    )
  end

  private def school_info_params
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
