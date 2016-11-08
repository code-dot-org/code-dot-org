class Api::V1::Pd::WorkshopAttendanceController < ApplicationController
  include Api::CsvDownload
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  before_action :authorize_manage_attendance, only: [:update]
  def authorize_manage_attendance
    authorize! :manage_attendance, @workshop
  end

  # GET /api/v1/pd/workshops/1/attendance
  def show
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

  # PATCH /api/v1/pd/workshops/1/attendance
  def update
    workshop_attendance_params[:session_attendances].each do |supplied_session_attendance|
      session = @workshop.sessions.find_by!(id: supplied_session_attendance[:session_id])
      existing_user_ids = session.attendances.map{|attendance| attendance.teacher.id}
      supplied_attendances = supplied_session_attendance[:attendances] || []
      attending_user_ids = []
      supplied_attendances.each do |attendance|
        if attendance[:id]
          attending_user_ids << attendance[:id].to_i
        elsif attendance[:email]
          teacher = create_teacher attendance[:email]

          # join the workshop section
          @workshop.section.add_student(teacher) if @workshop.section

          attending_user_ids << teacher.id
        end
      end

      new_attendees = attending_user_ids - existing_user_ids
      no_longer_attending = existing_user_ids - attending_user_ids

      new_attendees.each do |user_id|
        Retryable.retryable(tries: 2, on: ActiveRecord::RecordNotUnique) do
          Pd::Attendance.find_or_create_by! session: session, teacher: User.find_by_id!(user_id)
        end
      end
      no_longer_attending.each do |user_id|
        session.attendances.find_by(teacher_id: user_id).destroy
      end

      session.save!
    end

    head :no_content
  end

  private

  def create_teacher(email)
    require_admin

    enrollment = Pd::Enrollment.find_by_email!(email)
    params = {
      name: enrollment.full_name,
      email: email,
      school: enrollment.school
    }
    User.find_or_create_teacher(params, current_user)
  end

  def workshop_attendance_params
    params.require(:pd_workshop).permit(
      session_attendances: [
        :session_id,
        attendances: [:email, :id]
      ]
    )
  end
end
