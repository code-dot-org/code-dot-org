class FeaturedProjectsController < ApplicationController
  # The first time a project is featured.
  def create
    if current_user.try(:permission?, UserPermission::PROJECT_VALIDATOR)
      _, channel_id = storage_decrypt_channel_id(featured_project_params[:project_id])
      @featured_project = FeaturedProject.create({storage_app_id: channel_id, featured_at: DateTime.now, unfeatured_at: nil})
      puts "featured project in create #{@featured_project}"
      @featured_project.save!
    end
  end

  def unfeature
    if current_user.try(:permission?, UserPermission::PROJECT_VALIDATOR)
      _, channel_id = storage_decrypt_channel_id(featured_project_params[:project_id])
      puts "channel_id > #{channel_id}"
      @featured_project = FeaturedProject.find_by storage_app_id: channel_id
      @featured_project.update_attribute(:unfeatured_at, DateTime.now)
    end
  end

  def refeature
    if current_user.try(:permission?, UserPermission::PROJECT_VALIDATOR)
      _, channel_id = storage_decrypt_channel_id(featured_project_params[:project_id])
      @featured_project = FeaturedProject.find_by storage_app_id: channel_id
      @featured_project.update_attribute(:unfeatured_at, nil)
      @featured_project.update_attribute(:featured_at, DateTime.now)
    end
  end

  private

  def featured_project_params
    params.require(:featured_project).permit(:storage_app_id, :project_id)
  end
end
