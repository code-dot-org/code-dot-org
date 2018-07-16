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

  private

  def set_user_script
    @user_script = UserScript.find_or_create_by!(user: current_user, script_id: params[:script_id])
  end
end
