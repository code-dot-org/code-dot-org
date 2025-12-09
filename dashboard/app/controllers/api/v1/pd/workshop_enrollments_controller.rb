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
        response = render_to_json @workshop.enrollments, each_serializer: Api::V1::Pd::WorkshopEnrollmentCsvSerializer
        send_as_csv_attachment response, 'workshop_enrollments.csv'
      end
    end
  end

  # POST /api/v1/pd/workshops/1/enrollments
  def create
    @workshop = Pd::Workshop.find_by_id params[:workshop_id]
    if @workshop.nil?
      return render json: {submission_status: RESPONSE_MESSAGES[:NOT_FOUND]},
        status: :not_found
    elsif params[:user_id].nil? || !User.exists?(params[:user_id])
      return render_unsuccessful RESPONSE_MESSAGES[:ERROR], {error_message: 'User cannot be found.'}
    end

    user = User.find(params[:user_id])
    previous_enrollment = @workshop.enrollments.find_by(user_id: user.id)

    if user.user_type == User::TYPE_STUDENT
      return render_unsuccessful RESPONSE_MESSAGES[:ERROR], {error_message: 'Students cannot enroll in workshops.'}
    elsif previous_enrollment
      # See if a previous enrollment exists for this user
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
      ActiveRecord::Base.transaction do
        school_info = user.school_info
        enrollment = ::Pd::Enrollment.create!(
          workshop: @workshop,
          user_id: user.id,
          first_name: user.given_name,
          last_name: user.family_name,
          email: user.email,
          school: school_info&.school&.id || school_info&.school_id,
          school_info_id: school_info&.id
        )

        Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment).deliver_now
        Pd::WorkshopMailer.organizer_enrollment_receipt(enrollment).deliver_now

        # Also send to the teacher's alternate summer email if they entered it in their application and
        # it's for a summer workshop.
        if @workshop.subject == SUBJECT_SUMMER_WORKSHOP
          alt_summer_email = user&.alternate_email
          if alt_summer_email.present?
            Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment, alt_summer_email).deliver_now
          end
        end

        render json: {
          workshop_enrollment_status: RESPONSE_MESSAGES[:SUCCESS],
          account_exists: user.present?,
          sign_up_url: url_for('/users/sign_up/account_type'),
          cancel_url: url_for(action: :cancel, controller: '/pd/workshop_enrollment', code: enrollment.code)
        }
      rescue ActiveRecord::ValueTooLong
        render_unsuccessful RESPONSE_MESSAGES[:ERROR], {error_message: 'a response is too long'}
      rescue ActiveRecord::RecordInvalid => exception
        render_unsuccessful RESPONSE_MESSAGES[:ERROR], {error_message: exception.message}
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
    enrollment&.destroy!
    head :no_content
  end

  # DELETE /api/v1/pd/enrollments/:enrollment_code
  def cancel
    enrollment = Pd::Enrollment.find_by(code: params[:enrollment_code])
    return unless enrollment

    enrollment.destroy!
    Pd::WorkshopMailer.teacher_cancel_receipt(enrollment).deliver_now
    Pd::WorkshopMailer.organizer_cancel_receipt(enrollment).deliver_now

    # Also send to the user's alternate summer email if they entered it in their application
    # and it's for a summer workshop.
    if enrollment.workshop&.subject == SUBJECT_SUMMER_WORKSHOP
      alt_summer_email = enrollment.user&.alternate_email
      if alt_summer_email.present?
        Pd::WorkshopMailer.teacher_cancel_receipt(enrollment, alt_summer_email).deliver_now
      end
    end
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

  private def render_unsuccessful(error_message, options = {})
    render json: options.merge({workshop_enrollment_status: error_message}),
      status: :bad_request
  end

  private def workshop_closed?
    @workshop.state == STATE_ENDED
  end

  private def workshop_full?
    @workshop.enrollments.count >= @workshop.capacity
  end

  private def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_or_facilitator? user
  end
end
