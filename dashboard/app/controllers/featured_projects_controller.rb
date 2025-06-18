class FeaturedProjectsController < ApplicationController
  authorize_resource

  # Set a project as a featured project whose status is 'bookmarked'. It will be included
  # in the list of featured projects at 'projects/featured', but will not be displayed in the
  # public gallery until its status is 'active'.
  def bookmark
    _, project_id = storage_decrypt_channel_id(params[:channel_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_or_create_by!(project_id: project_id)
    @featured_project.update! unfeatured_at: nil, featured_at: nil
    reset_abuse_score
  end

  # Set the featured project to 'active', i.e., project will be displayed in public gallery.
  def feature
    _, project_id = storage_decrypt_channel_id(params[:channel_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_or_create_by!(project_id: project_id)
    @featured_project.update! unfeatured_at: nil, featured_at: DateTime.now
    # Set the featured project's abuse score to 0.
    reset_abuse_score
    freeze_featured_project(project_id)
  end

  # Set the featured project to 'archived', i.e., project will not be displayed in public gallery.
  def unfeature
    _, project_id = storage_decrypt_channel_id(params[:channel_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_by! project_id: project_id
    @featured_project.update! unfeatured_at: DateTime.now
    unfreeze_featured_project(project_id)
  end

  def destroy
    _, project_id = storage_decrypt_channel_id(params[:channel_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_by! project_id: project_id
    @featured_project.destroy!
  end

  # Featured projects are selected internally for their
  # quality, so we can be reasonably confident that they
  # are not abusive. We reset their abuse score to 0.
  def reset_abuse_score
    project = Project.find_by_channel_id(params[:channel_id])
    project.update! abuse_score: 0
    reset_file_abuse_score('assets')
    reset_file_abuse_score('files')
  end

  def reset_file_abuse_score(endpoint)
    bucket_type = endpoint == 'assets' ? AssetBucket : FileBucket
    buckets = bucket_type.new
    files = buckets.list(params[:channel_id])
    files.each do |file|
      buckets.replace_abuse_score(params[:channel_id], file[:filename], 0)
    end
  end

  def freeze_featured_project(project_id)
    project = Project.find_by(id: project_id)
    project_value = JSON.parse(project.value)
    project_value["frozen"] = true
    project_value["updatedAt"] = DateTime.now.to_s
    project.update! value: project_value.to_json
  end

  def unfreeze_featured_project(project_id)
    project = Project.find_by(id: project_id)
    project_value = JSON.parse(project.value)
    project_value["frozen"] = false
    # Unhide in case this project was frozen manually by the project owner.
    # If a project was frozen manually by the project owner before a project was featured
    # in the public gallery, the project will be hidden.
    # Since we are unfreezing the project, we unhide it as well.
    project_value["hidden"] = false
    project_value["updatedAt"] = DateTime.now.to_s
    project.update! value: project_value.to_json
  end
end
