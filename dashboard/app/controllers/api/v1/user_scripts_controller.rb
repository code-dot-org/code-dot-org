class Api::V1::UserScriptsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user_script, only: :update

  # PATCH /user_scripts/:script_id
  def update
    if @user_script.update(params.permit(:version_warning_dismissed))
      head :no_content
    else
      render json: @user_script.errors, status: :unprocessable_entity
    end
  end

  private def set_user_script
    unit = Unit.get_from_cache(params[:script_id])
    @user_script = UserScript.find_and_migrate_or_create_by!(user_id: current_user.id, unit: unit)
  end
end
