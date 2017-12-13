class FeaturedProjectsController < ApplicationController
  def create
    _, channel_id = storage_decrypt_channel_id(featured_project_params[:project_id])
    @featured_project = FeaturedProject.create({storage_app_id: channel_id, who_featured_user_id: current_user.id})
    @featured_project.save!
  end

  def destroy_featured_project
    _, channel_id = storage_decrypt_channel_id(params[:project_id])
    @featured_project = FeaturedProject.find_by_storage_app_id(channel_id)
    @featured_project.destroy
  end

  private

  def featured_project_params
    params.require(:featured_project).permit(:storage_app_id, :project_id, :who_featured_user_id)
  end
end
