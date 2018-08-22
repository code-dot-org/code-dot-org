class Api::V1::Pd::WorkshopEnrollmentsController < ApplicationController
  include Api::CsvDownload
  include ::Pd::WorkshopConstants
  load_and_authorize_resource :workshop, class: 'Pd::Workshop', except: ['create', 'cancel', 'confirm_join_session']

  load_and_authorize_resource :session, class: 'Pd::Session', find_by: :code, id_param: :session_code,
    only: [:confirm_join_session]

  RESPONSE_MESSAGES = {
    SUCCESS: "success".freeze,
    DUPLICATE: "duplicate".freeze,
    OWN: "own".freeze,
    CLOSED: "closed".freeze,
    FULL: "full".freeze,
    ACCOUNT_NEEDS_UPGRADE: "upgrade".freeze,
    NOT_FOUND: "not found".freeze,
    ERROR: "error".freeze
  }

  TEACHING_ROLES = [
    "Classroom Teacher".freeze,
    "Librarian".freeze,
    "Tech Teacher/Media Specialist".freeze
  ]

  # GET /api/v1/pd/workshops/1/enrollments
  def index
    response = render_to_json @workshop.enrollments, each_serializer: Api::V1::Pd::WorkshopEnrollmentSerializer

    respond_to do |format|
      format.json do
        render json: response
      end
      format.csv do
        send_as_csv_attachment response, 'workshop_enrollments.csv'
      end
    end
  end

  # POST /api/v1/pd/workshops/1/enrollments
  def create
    @workshop = Pd::Workshop.find_by_id params[:workshop_id]
    if @workshop.nil?
      return render json: {submission_status: RESPONSE_MESSAGES[:NOT_FOUND]},
        status: 404
    end

    enrollment_email = params[:email]
    user = User.find_by_email_or_hashed_email enrollment_email

    # See if a previous enrollment exists for this email
    previous_enrollment = @workshop.enrollments.find_by(email: enrollment_email)
    if previous_enrollment
      cancel_url = url_for action: :cancel, controller: '/pd/workshop_enrollment', code: previous_enrollment.code
      render_unsuccessful RESPONSE_MESSAGES[:DUPLICATE], {cancel_url: cancel_url}
    elsif workshop_owned_by? user
      workshop_url = CDO.studio_url("/pd/workshop_dashboard/workshops/#{@workshop.id}")
      render_unsuccessful RESPONSE_MESSAGES[:OWN], {workshop_url: workshop_url}
    elsif workshop_closed?
      render_unsuccessful RESPONSE_MESSAGES[:CLOSED]
    elsif workshop_full?
      render_unsuccessful RESPONSE_MESSAGES[:FULL]
    else
      enrollment = ::Pd::Enrollment.new workshop: @workshop
      enrollment.school_info_attributes = school_info_params
      if enrollment.update enrollment_params
        Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment).deliver_now
        Pd::WorkshopMailer.organizer_enrollment_receipt(enrollment).deliver_now

        render json: {
          workshop_enrollment_status: RESPONSE_MESSAGES[:SUCCESS],
          account_exists: enrollment.resolve_user.present?,
          sign_up_url: url_for('/users/sign_up'),
          cancel_url: url_for(action: :cancel, controller: '/pd/workshop_enrollment', code: enrollment.code)
        }
      else
        render_unsuccessful RESPONSE_MESSAGES[:ERROR]
      end
    end
  end

  # POST /api/v1/pd/attend/:session_code/join
  def confirm_join_session
    @enrollment = build_enrollment_from_params

    unless @enrollment.save
      render_unsuccessful RESPONSE_MESSAGES[:ERROR]
      return
    end

    if current_user.student?
      if User.hash_email(@enrollment.email) == current_user.hashed_email
        # Email matches user's hashed email. Upgrade to teacher and set email.
        current_user.update!(user_type: User::TYPE_TEACHER, email: @enrollment.email)
      else
        # No email match. Account needs to be upgraded via upgrade page.
        return render json: {
          workshop_enrollment_status: RESPONSE_MESSAGES[:ACCOUNT_NEEDS_UPGRADE]
        }
      end
    end

    render json: {
      workshop_enrollment_status: RESPONSE_MESSAGES[:SUCCESS]
    }
  end

  # DELETE /api/v1/pd/workshops/1/enrollments/1
  def destroy
    enrollment = @workshop.enrollments.find_by(id: params[:id])
    enrollment.destroy! if enrollment
    head :no_content
  end

  # DELETE /api/v1/pd/enrollments/:enrollment_code
  def cancel
    enrollment = Pd::Enrollment.find_by(code: params[:enrollment_code])
    return unless enrollment

    enrollment.destroy!
    Pd::WorkshopMailer.teacher_cancel_receipt(enrollment).deliver_now
    Pd::WorkshopMailer.organizer_cancel_receipt(enrollment).deliver_now
  end

  private

  def enrollment_params
    {
      first_name: params[:first_name],
      last_name: params[:last_name],
      email: params[:email],
      role: params[:role],
      grades_teaching: params[:grades_teaching]
    }
  end

  def school_info_params
    {
      school_type: params[:school_info][:school_type],
      school_state: params[:school_info][:school_state],
      school_zip: params[:school_info][:school_zip],
      school_district_name: params[:school_info][:school_district_name],
      school_district_other: params[:school_info][:school_district_other],
      school_id: params[:school_info][:school_id],
      school_name: params[:school_info][:school_name],
      country: "US" # we currently only support enrollment in pd for US schools
    }
  end

  def render_unsuccessful(error_message, options={})
    render json: options.merge({workshop_enrollment_status: error_message}),
      status: 400
  end

  def workshop_closed?
    @workshop.state == STATE_ENDED
  end

  def workshop_full?
    @workshop.enrollments.count >= @workshop.capacity
  end

  def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_or_facilitator? user
  end

  def build_enrollment_from_params
    enrollment = get_workshop_user_enrollment
    enrollment.assign_attributes enrollment_params.merge(user_id: current_user.id)
    enrollment.school_info_attributes = school_info_params

    enrollment
  end

  # Gets the workshop enrollment associated with the current user id or email if one exists.
  # Otherwise returns a new enrollment for that user.
  def get_workshop_user_enrollment
    @session.workshop.enrollments.where(
      'user_id = ? OR email = ?', current_user.id, current_user.email
    ).first || Pd::Enrollment.new(
      pd_workshop_id: @session.pd_workshop_id,
      user_id: current_user.id,
      full_name: current_user.name,
      email: current_user.email
    )
  end
end
