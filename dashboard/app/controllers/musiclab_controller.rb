class MusiclabController < ApplicationController
  ANALYTICS_KEY = CDO.amplitude_api_key
  PROJECT_BEATS_LEVEL_NAME = 'projectbeats'

  def index
    view_options(no_footer: true, full_width: true)
    @body_classes = "music-black"

    projects = Projects.new(get_storage_id)

    # Find the project ID (channel ID) for the /projectbeats Music Lab project. If there already
    # is a channel ID with the 'projectbeats' level name, then use that. If not, find the most
    # recent Music Lab project. If this project is standalone, it should be the existing
    # /projectbeats project. Create a new project with the 'projectbeats' level name, and copy
    # source code from the existing project so that users don't lose their code.
    project_beats_id = projects.most_recent(PROJECT_BEATS_LEVEL_NAME, include_hidden: true)
    if project_beats_id
      @channel_id = project_beats_id
    else
      last_music_project_id = projects.most_recent_project_type('music')

      new_project_data = {
        name: 'New Project Beats Project',
        level: polymorphic_url([PROJECT_BEATS_LEVEL_NAME.to_sym]),
        hidden: true
      }
      new_project_beats_id =
        ChannelToken.create_channel(request.ip, projects, data: new_project_data, type: 'music', standalone: false)

      if last_music_project_id && Project.find_by_channel_id(last_music_project_id).standalone
        SourceBucket.new.remix_source(last_music_project_id, new_project_beats_id, animation_list: [])
      end

      @channel_id = new_project_beats_id
    end
  end

  def menu
    view_options(full_width: true, responsive_content: true, no_padding_container: true)
  end

  def gallery
    unless current_user&.admin?
      render :no_access
    end

    view_options(full_width: true, responsive_content: true, no_padding_container: true)
    @channel_ids = Project.where(project_type: "music").last(50).map {|project| JSON.parse(project.value)["id"]}.compact_blank
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
