class MusiclabController < ApplicationController
  ANALYTICS_KEY = CDO.amplitude_api_key
  NUM_MINI_PLAYER_PROJECTS = 5
  # The hard-coded list of channel IDs for the mini player if the 'get_channel_ids_from_featured_projects_gallery'
  # DCDO flag is set to `false`. If the DCDO flag is set to `true`, then the channel IDs are randomly selected from
  # the set of active music lab featured projects. See get_selected_channel_ids below.
  CHANNELS = %w(
    RSDgNPmToACl-JRTVYAcTCbF46lyXXPRWOsHISyu3kc
    q0wDQmka3QRjS0EIH46XtSIQ_zJfhayM71YEqOAahao
    RSDgNPmToACl-JRTVYAcTCkE2DNnP529dBPfRByevCY
    pYNY-IR4sQxUR4CDNGxoNsTpYDympRPq9f0j6R06mec
    pYNY-IR4sQxUR4CDNGxoNrN_O4luFYm_Sxg6DnQUxyw
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

    selected_channel_ids = get_selected_channel_ids(params[:channels])

    @projects = get_project_details(selected_channel_ids)
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

  private def get_selected_channel_ids(channels_param = nil)
    channel_ids_from_params = channels_param.nil? ? [] : channels_param.split(',')
    channel_ids_from_featured_projects = CHANNELS
    if DCDO.get('get_channel_ids_from_featured_projects_gallery', true)
      featured_projects = ProjectsList.fetch_active_published_featured_projects('music')[:music]
      if featured_projects
        channel_ids_from_featured_projects = featured_projects.map {|project| project['channel']}
      end
    end
    all_channel_ids = channel_ids_from_params.empty? ?
      channel_ids_from_featured_projects :
      channel_ids_from_params
    all_channel_ids.sample(NUM_MINI_PLAYER_PROJECTS)
  end

  private def get_project_details(project_channel_ids)
    project_ids = project_channel_ids.map do |channel_id|
      _, project_id = storage_decrypt_channel_id(channel_id)
      project_id
    end
    Project.
      find(project_ids).
      map {|project| {name: JSON.parse(project.value)["name"], id: JSON.parse(project.value)["id"], labConfig: JSON.parse(project.value)["labConfig"]}}.
      compact_blank.
      to_json
  end
end
