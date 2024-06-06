class MusiclabController < ApplicationController
  ANALYTICS_KEY = CDO.amplitude_api_key
  NUM_MINI_PLAYER_PROJECTS = 5
  # Hard-coded list of channel IDs for the mini player if DCDO flag is set to `true`
  CHANNELS = %w(
    syBuoFelbGB3eOmNVoQGrWMXEk0l1EhkIX6c08ujq6s
    Ehnks69B0Whcn_YQQNCK4GUHAPU3WSG2jfilvQF1kfo
    6Xc53NIhwFxjjwsSaoj_eSiRbbXr97BYQ3W_7vIaAwY
    NwTkJSskTswEOtgy6TbaJ-8SonhhSxojrJjlJLBko4w
    PCO7mvB5ylByrbpF7tEbzXdYOqrALhW3M5OlcDRIF7E
  )

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

  # GET "/musiclab/embed"
  def embed
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    response.headers['Content-Security-Policy'] = ''

    view_options(no_header: true, no_footer: true, full_width: true, no_padding_container: true)

    channel_ids_from_params = params[:channels].nil? ? [] : params[:channels].split(',')
    channel_ids_from_featured_projects = CHANNELS
    if get_channel_ids_from_featured_projects_gallery?
      channel_ids_from_featured_projects = ProjectsList.fetch_active_published_featured_projects('music')["music"].map {|project| project['channel']}
    end
    all_channel_ids = channel_ids_from_params.empty? ?
      channel_ids_from_featured_projects :
      channel_ids_from_params
    selected_channel_ids = all_channel_ids.sample(NUM_MINI_PLAYER_PROJECTS)

    project_ids = selected_channel_ids.map do |channel_id|
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

  private def get_channel_ids_from_featured_projects_gallery?
    DCDO.get('get_channel_ids_from_featured_projects_gallery', true)
  end
end
