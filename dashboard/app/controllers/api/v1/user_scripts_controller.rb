class Api::V1::UserScriptsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user_script, only: :update

  # PATCH /user_scripts/:script_id
  # PATCH /api/v1/user_scripts/courses/:course_name/units/:unit_position
  def update
    if @user_script.update(params.permit(:version_warning_dismissed))
      head :no_content
    else
      render json: @user_script.errors, status: :unprocessable_entity
    end
  end

  private def set_user_script
    script = nil
    unit_group = nil

    if params[:script_id].present?
      script = Unit.get_from_cache(params[:script_id])
    else
      course_name = params[:course_name]
      unit_position = params[:unit_position]&.to_i
      context = Queries::Courses.get_unit_context(course_name, unit_position)
      script = context && context[:unit]
      unit_group = context && context[:unit_group]
    end

    unless script
      head :not_found
      return
    end

    @user_script = UserScript.find_or_create_by!(user: current_user, script: script, unit_group: unit_group)
  end
end
