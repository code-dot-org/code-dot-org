module Ops
  class WorkshopAttendanceController < ::ApplicationController
    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    load_and_authorize_resource

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
      @workshop_attendance.update!(params[:cohort])
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
    def cohort_params
      params.require(:workshop_attendance).permit(
          :teacher_id,
          :segment_id
      )
    end
  end
end