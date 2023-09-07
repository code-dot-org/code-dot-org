class FeaturedProjectsController < ApplicationController
  authorize_resource

  def feature
    _, project_id = storage_decrypt_channel_id(params[:project_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_or_create_by!(project_id: project_id)
    @featured_project.update! unfeatured_at: nil, featured_at: DateTime.now
    buffer_abuse_score
  end

  def unfeature
    _, project_id = storage_decrypt_channel_id(params[:project_id])
    return render_404 unless project_id
    @featured_project = FeaturedProject.find_by! project_id: project_id
    @featured_project.update! unfeatured_at: DateTime.now
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
end
