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
    buffer_abuse_score
  end

  # Set the featured project to 'active', i.e., project will be displayed in public gallery.
  def feature
    _, project_id = storage_decrypt_channel_id(params[:channel_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_or_create_by!(project_id: project_id)
    @featured_project.update! unfeatured_at: nil, featured_at: DateTime.now
    # Set the featured project's abuse score to -50.
    buffer_abuse_score
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
  # are not abusive. To prevent users from spamming Zendesk
  # with false reports of abuse on featured projects, this
  # sets their abuse score such that the project needs to
  # be reported many times before being blocked.
  def buffer_abuse_score(score = -50)
    channels_path = "/v3/channels/#{params[:project_id]}/buffer_abuse_score"
    assets_path = "/v3/assets/#{params[:project_id]}/"
    files_path = "/v3/files/#{params[:project_id]}/"

    ChannelsApi.call(
      'REQUEST_METHOD' => 'POST',
      'PATH_INFO' => channels_path,
      'REQUEST_PATH' => channels_path,
      'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
      'rack.input' => StringIO.new
    )

    FilesApi.call(
      'REQUEST_METHOD' => 'PATCH',
      'PATH_INFO' => assets_path,
      'REQUEST_PATH' => assets_path,
      'QUERY_STRING' => "abuse_score=#{score}",
      'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
      'rack.input' => StringIO.new
    )

    FilesApi.call(
      'REQUEST_METHOD' => 'PATCH',
      'PATH_INFO' => files_path,
      'REQUEST_PATH' => files_path,
      'QUERY_STRING' => "abuse_score=#{score}",
      'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
      'rack.input' => StringIO.new
    )
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
