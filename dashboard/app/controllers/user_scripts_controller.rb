class UserScriptsController < ApplicationController
  check_authorization
  load_and_authorize_resource

  # PATCH /user_scripts/1
  def update
    if @user_script.update(params.permit(:version_warning_dismissed))
      head :no_content
    else
      render json: @user_script.errors, status: :unprocessable_entity
    end
  end
end
