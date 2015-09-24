class UserLevelsController < ApplicationController
  before_filter :authenticate_user!
  check_authorization
  load_and_authorize_resource

  before_action :set_user_level

  # PATCH/PUT /user_levels/1
  # PATCH/PUT /user_levels/1.json
  def update
    respond_to do |format|
      if @user_level.update(user_level_params)
        format.json { head :no_content }
      else
        format.json { render json: @user_level.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_user_level
    @user_level = UserLevel.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_level_params
    params.require(:user_level).permit(:best_result)
  end
end
