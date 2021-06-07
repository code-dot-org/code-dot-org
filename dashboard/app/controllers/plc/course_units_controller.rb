class Plc::CourseUnitsController < ApplicationController
  load_and_authorize_resource

  # GET /launch/
  def launch
  end

  # POST /launch_plc_course/
  def launch_plc_course
    course_unit = Plc::CourseUnit.find(params[:plc_course_unit_id])
    raise ActiveRecord::RecordNotFound unless course_unit
    course_unit.launch
    course_unit.reload

    notice_string = if course_unit.started
                      "#{course_unit.unit_name} was launched"
                    else
                      "#{course_unit.unit_name} failed to launch"
                    end

    redirect_to action: :launch, notice: notice_string
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_course_enrollment_params
    params.permit(:plc_course_unit_id)
  end
end
