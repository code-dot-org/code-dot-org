class Api::V1::Pd::WorkshopAttendanceController < ApplicationController
  include Api::CsvDownload
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  load_resource :session, class: 'Pd::Session', through: :workshop, except: :index

  before_action :authorize_manage_attendance!, only: [:create, :destroy]
  def authorize_manage_attendance!
    authorize! :manage_attendance, @workshop
  end

  before_action :require_section, except: [:index, :show]
  def require_section
    msg = 'Section required. Workshop must be started in order to manage attendance.'
    raise ActionController::RoutingError.new(msg) unless @workshop.try(:section)
  end

  # GET /api/v1/pd/workshops/1/attendance
  def index
    respond_to do |format|
      format.json do
        render json: @workshop, serializer: ::Api::V1::Pd::WorkshopAttendanceSerializer
      end
      format.csv do
        # Use EnrollmentFlatAttendanceSerializer to get a single flat list of attendance
        # for each section by enrollment.
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
    teacher = @workshop.section.students.where(id: user_id).first

    # Admins can override and add a missing teacher to the section
    if teacher.nil? && current_user.admin? && params[:admin_override]
      # Still the teacher account must exist.
      teacher = User.find_by!(id: user_id, user_type: User::TYPE_TEACHER)
      @workshop.section.add_student teacher
    end

    # renders a 404 (not found)
    raise ActiveRecord::RecordNotFound.new('teacher required') unless teacher

    create_attendance session: @session, teacher: teacher
    head :no_content
  end

  # PUT /api/v1/pd/workshops/1/attendance/:session_id/enrollment/:enrollment_id
  def create_by_enrollment
    # renders a 404 (not found)
    raise ActiveRecord::RecordNotFound.new('account required. Use create action') if @workshop.account_required_for_attendance?

    enrollment_id = params[:enrollment_id]
    enrollment = @workshop.enrollments.find(enrollment_id)

    create_attendance session: @session, enrollment: enrollment
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

  private

  def create_attendance(attendance_params)
    # Idempotent: Find existing, restore deleted, or create a new attendance row.
    attendance = nil
    Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      attendance = Pd::Attendance.with_deleted.find_by(attendance_params) ||
        Pd::Attendance.create!(attendance_params)
    end
    attendance.restore if attendance.deleted?
  end
end
