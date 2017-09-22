class Api::V1::Pd::WorkshopAttendanceController < ApplicationController
  include Api::CsvDownload

  load_and_authorize_resource :workshop, class: 'Pd::Workshop'
  load_resource :session, class: 'Pd::Session', through: :workshop, except: :index

  before_action :authorize_manage_attendance!, only: [:create, :destroy]
  def authorize_manage_attendance!
    authorize! :manage_attendance, @workshop
  end

  # GET /api/v1/pd/workshops/1/attendance
  def index
    respond_to do |format|
      format.json do
        render json: @workshop, serializer: ::Api::V1::Pd::WorkshopAttendanceSerializer
      end
      format.csv do
        # Use EnrollmentFlatAttendanceSerializer to get a single flat list of attendance
        # for each session by enrollment.
        response = render_to_json @workshop.enrollments,
          each_serializer: Api::V1::Pd::EnrollmentFlatAttendanceSerializer

        send_as_csv_attachment response, 'workshop_attendance.csv'
      end
    end
  end

  # GET /api/v1/pd/workshops/1/attendance/:session_id
  def show
    render json: @session, serializer: Api::V1::Pd::SessionAttendanceSerializer
  end

  # PUT /api/v1/pd/workshops/1/attendance/:session_id/user/:user_id
  def create
    user_id = params[:user_id]
    teacher = User.find(user_id)

    # Attempt to find a matching enrollment
    enrollment = @workshop.enrollments.find_by!('user_id = ? OR email = ?', user_id, teacher.email)

    attendance = Pd::Attendance.find_restore_or_create_by! session: @session, teacher: teacher
    attendance.update! marked_by_user: current_user, enrollment: enrollment
    head :no_content
  end

  # PUT /api/v1/pd/workshops/1/attendance/:session_id/enrollment/:enrollment_id
  def create_by_enrollment
    # renders a 404 (not found)
    raise ActiveRecord::RecordNotFound.new('account required. Use create action') if @workshop.account_required_for_attendance?

    enrollment_id = params[:enrollment_id]
    enrollment = @workshop.enrollments.find(enrollment_id)

    attendance = Pd::Attendance.find_restore_or_create_by! session: @session, enrollment: enrollment
    attendance.update! marked_by_user: current_user
    head :no_content
  end

  # DELETE /api/v1/pd/workshops/1/attendance/:session_id/user/:user_id
  def destroy
    user_id = params[:user_id]
    attendance = Pd::Attendance.find_by(session: @session, teacher_id: user_id)
    attendance.destroy! if attendance

    head :no_content
  end

  # DELETE /api/v1/pd/workshops/1/attendance/:session_id/enrollment/:enrollment_id
  def destroy_by_enrollment
    enrollment_id = params[:enrollment_id]
    enrollment = @workshop.enrollments.find(enrollment_id)
    attendance = Pd::Attendance.find_by(session: @session, enrollment: enrollment)
    attendance.destroy! if attendance

    head :no_content
  end
end
