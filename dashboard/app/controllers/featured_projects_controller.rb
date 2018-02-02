class FeaturedProjectsController < ApplicationController
  def feature
    if current_user.try(:permission?, UserPermission::PROJECT_VALIDATOR)
      _, channel_id = storage_decrypt_channel_id(featured_project_params[:project_id])
      @featured_project = FeaturedProject.find_or_create_by(storage_app_id: channel_id)
      @featured_project.update_attribute(:unfeatured_at, nil)
      @featured_project.update_attribute(:featured_at, DateTime.now)
      @featured_project.save!
    end
  end

  def unfeature
    if current_user.try(:permission?, UserPermission::PROJECT_VALIDATOR)
      _, channel_id = storage_decrypt_channel_id(featured_project_params[:project_id])
      @featured_project = FeaturedProject.find_by storage_app_id: channel_id
      @featured_project.update_attribute(:unfeatured_at, DateTime.now)
    end
  end

  private

  def featured_project_params
    params.require(:featured_project).permit(:storage_app_id, :project_id)
  end
end
