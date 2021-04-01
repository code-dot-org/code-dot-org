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
  end
end
