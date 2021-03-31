class Plc::CourseUnitController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env

  # PUT /launch/:course_unit_name
  def launch
    course_unit = Plc::CourseUnit.find_by(unit_name: params[:course_unit_name])
    raise ActiveRecord::RecordNotFound unless course_unit
    course_unit.launch
  end
end
