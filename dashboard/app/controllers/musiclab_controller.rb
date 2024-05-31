class MusiclabController < ApplicationController
  ANALYTICS_KEY = CDO.amplitude_api_key

  def menu
    view_options(full_width: true, responsive_content: true, no_padding_container: true)
  end

  def gallery
    unless current_user&.admin?
      render :no_access
    end

    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    @channel_ids = Project.
      where(project_type: "music").
      last(30).
      reverse.
      map {|project| {name: JSON.parse(project.value)["name"], id: JSON.parse(project.value)["id"], labConfig: JSON.parse(project.value)["labConfig"]}}.
      select {|entry| entry[:id] && entry[:labConfig]}.
      compact_blank.
      to_json
  end

  def embed
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    response.headers['Content-Security-Policy'] = ''

    view_options(no_header: true, no_footer: true, full_width: true, no_padding_container: true)

    # channel_ids = params[:channels] ? params[:channels].split(',') : []
    channel_ids = ProjectsList.fetch_active_published_featured_projects('applab')
    puts "channel_ids: #{channel_ids}"

    project_ids = channel_ids.map do |channel_id|
      _, project_id = storage_decrypt_channel_id(channel_id)
      project_id
    end

    @projects = Project.
      find(project_ids).
      map {|project| {name: JSON.parse(project.value)["name"], id: JSON.parse(project.value)["id"], labConfig: JSON.parse(project.value)["labConfig"]}}.
      compact_blank.
      to_json
  end

  # TODO: This is a temporary addition to serve the analytics API key
  # specifically for Music Lab. When we start using Amplitude for other
  # applications, we should create a dedicated controller/util that serves
  # API keys for various analytics projects, not just Music Lab.
  # We may also need to move the Amplitude analytics reporting
  # client to the back-end to avoid exposing keys (as we are currently).

  # GET /musiclab/analytics_key
  def get_analytics_key
    render(json: {key: ANALYTICS_KEY})
  end
end
