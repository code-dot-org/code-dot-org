class UserLevelsController < ApplicationController
  before_action :authenticate_user!
  check_authorization
  load_and_authorize_resource
  protect_from_forgery except: [:update] # referer is the script level page which is publically cacheable

  before_action :set_user_level

  # PATCH/PUT /user_levels/1
  # PATCH/PUT /user_levels/1.json
  def update
    if @user_level.update(user_level_params)
      head :no_content
    else
      render json: @user_level.errors, status: :unprocessable_entity
    end
  end

  def destroy
    # depend on authorization methods to ensure that the only person that can
    # delete a student's progress is their teacher
    @user_level.delete
    head :no_content
  end

  def delete_predict_level_progress
    script = Unit.get_from_cache(params[:script_id])
    return head :not_found, text: 'Unit not found' unless script
    return head :forbidden, text: 'User must be instructor of course' unless script.can_be_instructor?(current_user)
    level = Level.find(params[:level_id])
    return head :not_found, text: 'Level not found' unless level
    return head :bad_request, text: "Clearing progress on level type #{level.type} is not supported" unless ['Multi', 'FreeResponse'].include?(level.type)
    UserLevel.where(user_id: current_user.id, script_id: script.id, level: level.id).destroy_all
    return head :ok
  end

  # GET /user_levels/get_token
  def get_token
    headers['csrf-token'] = form_authenticity_token
    return head :ok
  end

  private def set_user_level
    return unless params[:id]
    @user_level = UserLevel.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  private def user_level_params
    params.require(:user_level).permit(:best_result, :submitted)
  end
end
