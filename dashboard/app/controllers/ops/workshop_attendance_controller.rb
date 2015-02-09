module Ops
  class WorkshopAttendanceController < ::ApplicationController
    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    load_and_authorize_resource :segment
    # Load shallow nested resource. See https://github.com/CanCanCommunity/cancancan/wiki/Nested-Resources#shallow-nesting
    load_and_authorize_resource through: :segment, through_association: :attendances, shallow: true

    # GET /ops/attendance/teacher/1
    def teacher

    end

    # POST /ops/attendance/1
    def create
      @workshop_attendance.save!
      render text: 'OK'
    end

    # GET /ops/attendance
    def index
      render json: @workshop_attendance.as_json
    end

    # GET /ops/attendance/1
    def show
      render json: @workshop_attendance.as_json
    end

    # PATCH/PUT /ops/attendance/1
    def update
      @workshop_attendance.update_attributes(params[:workshop_attendance])
      render json: @workshop_attendance.as_json
    end

    # DELETE /ops/attendance/1
    def destroy
      @workshop_attendance.destroy
      render text: 'OK'
    end

    private
    # Required for CanCanCan to work with strong parameters
    # (see: http://guides.rubyonrails.org/action_controller_overview.html#strong-parameters)
    def workshop_attendance_params
      params.require(:workshop_attendance).permit(
          :teacher_id,
          :segment_id,
          :status
      )
    end
  end
end
