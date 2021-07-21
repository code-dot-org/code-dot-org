class ReviewableProjectsController < ApplicationController
  before_action :authenticate_user!
  before_action :decrypt_channel_id, only: [:create]

  check_authorization
  load_and_authorize_resource :reviewable_project, only: [:destroy]

  # POST /reviewable_projects
  def create
    authorize! :create, ReviewableProject

    @reviewable_project = ReviewableProject.where(
      user_id: current_user.id,
      storage_app_id: @storage_app_id,
      script_id: params[:script_id],
      level_id: params[:level_id]
    ).first_or_create

    if @reviewable_project.save
      return render json: @reviewable_project
    else
      return head :bad_request
    end
  end

  # DELETE /reviewable_projects/:id
  def destroy
    if @reviewable_project.delete
      return head :ok
    else
      return head :bad_request
    end
  end

  def decrypt_channel_id
    # TO DO: handle errors in decrypting, or can't find user
    _, @storage_app_id = storage_decrypt_channel_id(params[:channel_id])
  end
end
