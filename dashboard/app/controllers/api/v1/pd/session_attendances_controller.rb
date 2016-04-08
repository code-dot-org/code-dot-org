class Api::V1::Pd::SessionAttendancesController < ApplicationController
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  # GET /api/v1/pd/workshops/1/session_attendances
  def index
    render json: @workshop.sessions, each_serializer: Api::V1::Pd::SessionAttendanceSerializer
  end

  # PATCH /api/v1/pd/workshops/1/session_attendances
  def bulk_update
    session_attendance_params[:session_attendances].each do |supplied_session_attendance|
      session = @workshop.sessions.find_by!(id: supplied_session_attendance[:session_id])
      existing_user_ids = session.attendances.map{|attendance| attendance.teacher.id}
      supplied_user_ids = supplied_session_attendance[:attendances] || []

      new_attendees = supplied_user_ids - existing_user_ids
      no_longer_attending = existing_user_ids - supplied_user_ids

      new_attendees.each do |user_id|
        Pd::Attendance.create session: session, teacher: User.find(user_id)
      end
      no_longer_attending.each do |user_id|
        session.attendances.find_by!(teacher_id: user_id).delete
      end

      session.save!
    end

    head :no_content
  end

  private

  def session_attendance_params
    params.require(:pd_workshop).permit(
      session_attendances: [
        :session_id,
        attendances: []
      ]
    )
  end
end
