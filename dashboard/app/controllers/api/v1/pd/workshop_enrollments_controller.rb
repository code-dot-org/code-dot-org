class Api::V1::Pd::WorkshopEnrollmentsController < ApplicationController
  include Api::CsvDownload
  include ::Pd::WorkshopConstants
  load_and_authorize_resource :workshop, class: 'Pd::Workshop', except: ['create', 'cancel', 'move']

  before_action :authorize_update_scholarship_info!, only: 'update_scholarship_info'
  def authorize_update_scholarship_info!
    @enrollment = Pd::Enrollment.find(params[:enrollment_id])
    authorize! :update_scholarship_info, @enrollment
  end

  RESPONSE_MESSAGES = {
    SUCCESS: "success".freeze,
    DUPLICATE: "duplicate".freeze,
    OWN: "own".freeze,
    CLOSED: "closed".freeze,
    FULL: "full".freeze,
    NOT_FOUND: "not found".freeze,
    ERROR: "error".freeze
  }

  # GET /api/v1/pd/workshops/1/enrollments
  def index
    respond_to do |format|
      format.json do
        render json: @workshop.enrollments, each_serializer: Api::V1::Pd::WorkshopEnrollmentSerializer
      end
      format.csv do
        response = render_to_json @workshop.enrollments, each_serializer: Api::V1::Pd::WorkshopEnrollmentSerializer
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
        if user
          user.update_school_info(enrollment.school_info)
        end
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

  # POST /api/v1/pd/enrollment/:enrollment_id/scholarship_info
  def update_scholarship_info
    @enrollment.update_scholarship_status(params[:scholarship_status])
    render json: @enrollment, serializer: Api::V1::Pd::WorkshopEnrollmentSerializer
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

  # POST /api/v1/pd/enrollments/move
  def move
    return head :forbidden unless current_user.workshop_admin?
    Pd::Enrollment.transaction do
      enrollments = Pd::Enrollment.where(id: params[:enrollment_ids])
      Pd::Attendance.where(pd_enrollment_id: enrollments).delete_all
      enrollments.each {|e| e.update!(pd_workshop_id: params[:destination_workshop_id])}
    end
  end

  # POST /api/v1/pd/enrollments/edit
  def edit
    return head :forbidden unless current_user.workshop_admin?
    enrollment = Pd::Enrollment.find_by(id: params[:id])
    enrollment.update!(first_name: params[:first_name], last_name: params[:last_name])
  end

  private

  def enrollment_params
    {
      first_name: params[:first_name],
      last_name: params[:last_name],
      email: params[:email],
      role: params[:role],
      grades_teaching: params[:grades_teaching],
      attended_csf_intro_workshop: params[:attended_csf_intro_workshop],
      csf_course_experience: params[:csf_course_experience],
      csf_courses_planned: params[:csf_courses_planned],
      csf_has_physical_curriculum_guide: params[:csf_has_physical_curriculum_guide],
      previous_courses: params[:previous_courses],
      replace_existing: params[:replace_existing],
      csf_intro_intent: params[:csf_intro_intent],
      csf_intro_other_factors: params[:csf_intro_other_factors],
      # params only collected in CSP returning teachers workshop
      years_teaching: params[:years_teaching],
      years_teaching_cs: params[:years_teaching_cs],
      taught_ap_before: params[:taught_ap_before],
      planning_to_teach_ap: params[:planning_to_teach_ap]
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
end
