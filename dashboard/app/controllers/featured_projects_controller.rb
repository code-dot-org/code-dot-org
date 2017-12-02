class FeaturedProjectsController < ApplicationController
  def create
    storage_app_id = storage_decrypt_channel_id(featured_project_params[:project_id])
    @featured_project = FeaturedProject.create({storage_app_id: storage_app_id[0], who_featured_user_id: current_user.id})
    @featured_project.save!
  end

  private

  def featured_project_params
    params.require(:featured_project).permit(:storage_app_id, :project_id, :who_featured_user_id)
  end
end
