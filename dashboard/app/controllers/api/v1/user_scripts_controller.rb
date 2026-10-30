class Api::V1::UserScriptsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user_script, only: :update

  # Use `course` and `unit` (singular) to differentiate from other routes which typically use
  # plurals to refer to course_name and unit_position.
  # PATCH /api/v1/user_scripts/course/:course_id/unit/:script_id
  def update
    if @user_script.update(params.permit(:version_warning_dismissed))
      head :no_content
    else
      render json: @user_script.errors, status: :unprocessable_entity
    end
  end

  private def set_user_script
    script_id = params.require(:script_id)
    unit = Unit.get_from_cache(script_id)
    course_id = params.require(:course_id)
    unit_group = UnitGroup.get_from_cache(course_id)

    unless unit && unit_group
      head :not_found
      return
    end

    @user_script = UserScript.find_and_migrate_or_create_by!(user_id: current_user.id, unit: unit, unit_group: unit_group)
  end
end
