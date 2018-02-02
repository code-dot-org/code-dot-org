class FeaturedProjectsController < ApplicationController
  authorize_resource

  def feature
    _, channel_id = storage_decrypt_channel_id(params[:project_id])
    return render_404 unless channel_id
    @featured_project = FeaturedProject.find_or_create_by!(storage_app_id: channel_id)
    @featured_project.update_attribute(:unfeatured_at, nil)
    @featured_project.update_attribute(:featured_at, DateTime.now)
    @featured_project.save!
  end

  def unfeature
    _, channel_id = storage_decrypt_channel_id(params[:project_id])
    return render_404 unless channel_id
    @featured_project = FeaturedProject.find_by storage_app_id: channel_id
    @featured_project.update_attribute(:unfeatured_at, DateTime.now)
  end
end
