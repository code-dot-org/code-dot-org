require 'active_support/core_ext/hash/indifferent_access'


class ProjectsController < ApplicationController
  before_action :authenticate_user!, except: [:load, :create_new, :show, :edit, :readonly, :redirect_legacy, :public, :index, :export_config, :weblab_footer, :get_or_create_for_level, :can_publish_age_status]
  before_action :redirect_admin_from_labs, only: [:load, :create_new, :show, :edit, :remix]
  before_action :authorize_load_project!, only: [:load, :create_new, :edit, :remix]
  before_action :set_level, only: [:load, :create_new, :show, :edit, :readonly, :remix, :export_config, :export_create_channel]
  protect_from_forgery except: :export_config
  include LevelsHelper

  TEMPLATES = %w(projects).freeze

  # Number of projects in millions, rounded down. tracked and updated by marketing
  PROJECT_COUNT_MILLIONS = 210

  # @type [Hash[Hash]] A map from project type to a hash with the following options
  # representing properties of this project type:
  # @option {String} :name The name of the level to use for this project type.
  # @option {Boolean|nil} :levelbuilder_required Whether you must have
  #   UserPermission::LEVELBUILDER to access this project type. Default: false.
  # @option {Boolean|nil} :login_required Whether you must be logged in to
  #   access this project type. Default: false.
  # @option {String|nil} :default_image_url If present, set this as the
  #   thumbnail image url when creating a project of this type.
  # @option {Boolean|nil} :i18n If present, include this level in the i18n sync
  STANDALONE_PROJECTS = {
    adaptations: {
      name: 'New Adaptations Project'
    },
    artist: {
      name: 'New Artist Project',
      i18n: true
    },
    artist_k1: {
      name: 'New K1 Artist Project',
      i18n: true
    },
    frozen: {
      name: 'New Frozen Project',
      i18n: true
    },
    playlab: {
      name: 'New Play Lab Project',
      i18n: true
    },
    playlab_k1: {
      name: 'New K1 Play Lab Project',
      i18n: true
    },
    starwars: {
      name: 'New Star Wars Project'
    },
    starwarsblocks_hour: {
      name: 'New Star Wars Blocks Project'
    },
    starwarsblocks: {
      name: 'New Star Wars Expanded Blocks Project',
      i18n: true
    },
    iceage: {
      name: 'New Ice Age Project',
      i18n: true
    },
    infinity: {
      name: 'New Infinity Project',
      i18n: true
    },
    gumball: {
      name: 'New Gumball Project',
      i18n: true
    },
    flappy: {
      name: 'New Flappy Project',
      # We do not currently generate thumbnails for flappy, so specify a
      # placeholder image here. This allows flappy projects to show up in the
      # public gallery, and to be published from the share dialog.
      #
      # NOTE: if changing this URL, update project thumbnail URL validation as well
      default_image_url: '/blockly/media/flappy/placeholder.jpg',
    },
    minecraft_codebuilder: {
      name: 'New Minecraft Code Connection Project'
    },
    minecraft_adventurer: {
      name: 'New Minecraft Adventurer Project',
      i18n: true
    },
    minecraft_designer: {
      name: 'New Minecraft Designer Project',
      i18n: true
    },
    minecraft_hero: {
      name: 'New Minecraft Hero Project',
      i18n: true
    },
    minecraft_aquatic: {
      name: 'New Minecraft Aquatic Project',
      i18n: true
    },
    applab: {
      name: 'New App Lab Project',
      login_required: true
    },
    gamelab: {
      name: 'New Game Lab Project',
      login_required: true,
    },
    gamelab_jr: {
      name: 'New Game Lab Jr Project',
      levelbuilder_required: true,
    },
    spritelab: {
      name: 'New Sprite Lab Project',
      i18n: true
    },
    dance: {
      name: 'New Dance Lab Project',
      # NOTE: if changing this URL, update project thumbnail URL validation as well
      default_image_url: '/blockly/media/dance/placeholder.png',
      i18n: true
    },
    makerlab: {
      name: 'New Maker Lab Project',
      login_required: true
    },
    weblab: {
      name: 'New Web Lab Project',
      login_required: true
    },
    bounce: {
      name: 'New Bounce Project',
      i18n: true
    },
    sports: {
      name: 'New Sports Project',
      i18n: true
    },
    basketball: {
      name: 'New Basketball Project',
      i18n: true
    },
    algebra_game: {
      name: 'New Algebra Project'
    },
    calc: {
      name: 'Calc Free Play'
    },
    eval: {
      name: 'Eval Free Play'
    },
    javalab: {
      name: 'New Java Lab Project',
      login_required: true
    },
    music: {
      name: 'New Music Lab Project',
      i18n: true
    },
    poetry: {
      name: 'New Poetry Project'
    },
    poetry_hoc: {
      name: 'New Poetry HOC Project'
    },
    thebadguys: {
      name: 'New The Bad Guys Project'
    },
    story: {
      name: 'New Story Project'
    },
    science: {
      name: 'New Science Project'
    },
    time_capsule: {
      name: 'New Time Capsule Project'
    },
    ecosystems: {
      name: 'New Ecosystems Project'
    },
    game_design: {
      name: 'New Game Design Project'
    },
    pythonlab: {
      name: 'New Python Lab Project'
    },
    transformers: {
      name: 'New Transformers Project'
    }
    # Note: When adding to this list, remember that project level files must include "is_project_level": true
  }.with_indifferent_access.freeze

  @@project_level_cache = {}

  # GET /projects/:tab_name
  # Where a valid :tab_name is (nil|public|libraries)
  def index
    unless params[:tab_name] == 'public'
      return redirect_to '/projects/public' unless current_user
      redirect_admin_from_labs
    end

    view_options(full_width: true, responsive_content: false, no_padding_container: true, has_i18n: true)
    @current_tab = params[:tab_name]
    @project_count_millions = PROJECT_COUNT_MILLIONS
  end

  def project_and_featured_project_fields
    [
      :projects__id___id,
      :projects__storage_id___storage_id,
      :projects__value___value,
      :projects__project_type___project_type,
      :projects__published_at___published_at,
      :featured_projects__featured_at___featured_at,
      :featured_projects__unfeatured_at___unfeatured_at,
      :featured_projects__topic___topic
    ]
  end

  def combine_projects_and_featured_projects_data
    projects = "#{CDO.dashboard_db_name}__projects".to_sym
    project_featured_project_combo_data = DASHBOARD_DB[:featured_projects].
      select(*project_and_featured_project_fields).
      join(projects, id: :storage_app_id, state: 'active').all
    extract_data_for_tables(project_featured_project_combo_data)
  end

  def get_featured_project_status(featured_at, unfeatured_at)
    return SharedConstants::FEATURED_PROJECT_STATUS.archived if featured_at && unfeatured_at
    return SharedConstants::FEATURED_PROJECT_STATUS.active if featured_at
    SharedConstants::FEATURED_PROJECT_STATUS.bookmarked
  end

  def extract_data_for_tables(project_featured_project_combo_data)
    @featured_project_table_rows = []
    project_featured_project_combo_data.each do |project_details|
      project_details_value = JSON.parse(project_details[:value])
      channel = storage_encrypt_channel_id(project_details[:storage_id], project_details[:id])
      status = get_featured_project_status(project_details[:featured_at], project_details[:unfeatured_at])
      featured_project_row = {
        projectName: project_details_value['name'],
        channel: channel,
        type: project_details[:project_type],
        topic: project_details[:topic],
        publishedAt: project_details[:published_at],
        thumbnailUrl: project_details_value['thumbnailUrl'],
        featuredAt: project_details[:featured_at],
        unfeaturedAt: project_details[:unfeatured_at],
        status: status
      }
      @featured_project_table_rows << featured_project_row
    end
    sort_featured_projects(@featured_project_table_rows)
  end

  # @param [Array {Hash}] Each hash is data for a row in the featured projects tables.
  # The rows are sorted into three arrays: active, archived, or bookmarked.
  def sort_featured_projects(featured_project_table_rows)
    @active = []
    @archived = []
    @bookmarked = []
    featured_project_table_rows.each do |row|
      status = get_featured_project_status(row[:featuredAt], row[:unfeaturedAt])
      if status == SharedConstants::FEATURED_PROJECT_STATUS.archived
        @archived << row
      elsif status == SharedConstants::FEATURED_PROJECT_STATUS.active
        @active << row
      else
        @bookmarked << row
      end
    end
  end

  # GET /projects/featured
  # Access is restricted to those with project_validator permission
  def featured
    if current_user&.project_validator?
      combine_projects_and_featured_projects_data
      render template: 'projects/featured'
    else
      redirect_to '/projects/public', flash: {alert: 'Only project validators can feature projects.'}
    end
  end

  # Renders a <script> tag with JS to redirect /p/:key#:channel_id/:action to /projects/:key/:channel_id/:action.
  def redirect_legacy
    render layout: nil
  end

  def load
    return if redirect_under_13_without_tos_teacher(@level)
    if current_user
      channel = Projects.new(storage_id_for_current_user).most_recent(params[:key])
      if channel
        redirect_to action: 'edit', channel_id: channel
        return
      end
    end

    create_new
  end

  def create_new
    return if redirect_under_13_without_tos_teacher(@level)
    channel = ChannelToken.create_channel(
      request.ip,
      Projects.new(get_storage_id),
      data: initial_data,
      type: params[:key]
    )
    redirect_to(
      action: 'edit',
      channel_id: channel,
      enableMaker: params['enableMaker'] ? true : nil
    )
  end

  # GET /projects(/script/:script_id)/level/:level_id(/user/:user_id)
  # Given a level_id and the current user (or signed out user), get the existing project
  # or create a new project for that level and user. If a script_id is provided, get or
  # create the project for that level, script and user.
  # If a user_id is provided, get but do not create the project for that level, script and
  # user_id; this is used for Lab2 levels when a teacher views a student's work, and the
  # relevant permission is verified here.
  # Returns json: {channel: <encrypted-channel-token>}
  def get_or_create_for_level
    script_id = params[:script_id]
    script_level_id = params[:script_level_id]
    level = Level.find(params[:level_id])
    user_id = params[:user_id]

    error_message = under_13_without_tos_teacher?(level)
    return render(status: :forbidden, json: {error: error_message}) if error_message

    # If viewing another user's work, ensure that we have permission.
    if user_id
      # If a script level ID was provided, ensure it matches the level ID.
      if script_level_id
        script_level = ScriptLevel.cache_find(script_level_id.to_i)
        same_level = script_level.oldest_active_level.id == level.id
        is_sublevel = ParentLevelsChildLevel.exists?(child_level_id: level.id, parent_level_id: script_level.oldest_active_level.id)
        return render(status: :forbidden, json: {error: "Access denied."}) unless same_level || is_sublevel
      else
        script_level = level.script_levels.find_by_script_id(script_id)
      end
      user = User.find(user_id)
      unless can?(:view_as_user, script_level, user)
        return render(status: :forbidden, json: {error: "Access denied."})
      end

      # And return early if the level has not been started.
      script = Unit.get_from_cache(script_id)
      unless level_started?(level, script, user)
        return render(status: :ok, json: {started: false})
      end

      user_storage_id = storage_id_for_user_id(user_id)

      # Find the channel for the user and level, if it exists.
      channel_token = ChannelToken.find_channel_token(level, user_storage_id, script_id)
    else
      # get_storage_id works for signed out users as well; it uses the cookie to determine
      # the storage id.
      user_storage_id = get_storage_id

      # Find the channel for the user and level if it exists, or create a new one.
      channel_token = ChannelToken.find_or_create_channel_token(level, request.ip, user_storage_id, script_id, {hidden: true})
    end

    # We can limit channel updates during periods of high use using the updateChannelOnSave flag.
    script_name = !script_id.nil? && Unit.find(script_id)&.name
    reduce_channel_updates = script_name ?
                              !Gatekeeper.allows("updateChannelOnSave", where: {script_name: script_name}, default: true) :
                              false

    render(status: :ok, json: {channel: channel_token.channel, reduceChannelUpdates: reduce_channel_updates})
  end

  def weblab_footer
    render partial: 'projects/weblab_footer'
  end

  def show
    if @level.deprecated?
      return render 'errors/deprecated_course'
    end

    if params.key?(:nosource)
      # projects can optionally be embedded without making their source
      # available. to keep people from just twiddling the url to get to the
      # regular project page, we encode the channel id using a simple
      # cipher. This is not meant to be secure in any way, just meant to make it
      # slightly less trivial than changing the url to get to the project
      # source. The channel id gets encoded when generating the embed url.

      alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      cipher = 'Iq61F8kiaUHPGcsY7DgX4yAu3LwtWhnCmeR5pVrJoKfQZMx0BSdlOjEv2TbN9z'
      params[:channel_id] = params[:channel_id].tr(cipher, alphabet)
    end

    redirect_for_lab2 = redirect_edit_view_for_lab2
    return redirect_for_lab2 if redirect_for_lab2

    iframe_embed = params[:iframe_embed] == true
    iframe_embed_app_and_code = params[:iframe_embed_app_and_code] == true
    sharing = iframe_embed || params[:share] == true
    set_lab2_responsive_view_options(sharing)
    readonly = params[:readonly] == true
    if iframe_embed || iframe_embed_app_and_code
      # explicitly set security related headers so that this page can actually
      # be embedded.
      response.headers['X-Frame-Options'] = 'ALLOWALL'
      response.headers['Content-Security-Policy'] = ''
    end
    level_view_options(
      @level.id,
      hide_source: sharing,
      share: sharing,
      iframe_embed: iframe_embed,
      iframe_embed_app_and_code: iframe_embed_app_and_code,
      project_type: params[:key]
    )
    # for sharing pages, the app will display the footer inside the playspace instead
    # if the game doesn't own the sharing footer, treat it as a legacy share
    @legacy_share_style = sharing && !@game.owns_footer_for_share?
    view_options(
      readonly_workspace: sharing || readonly,
      full_width: true,
      callouts: [],
      channel: params[:channel_id],
      no_footer: sharing || iframe_embed_app_and_code || @game&.no_footer?,
      code_studio_logo: sharing && !iframe_embed,
      no_header: sharing || iframe_embed_app_and_code,
      small_footer: !iframe_embed_app_and_code && !sharing && (@game&.uses_small_footer? || @level&.enable_scrolling?),
      has_i18n: @game.has_i18n?,
      game_display_name: data_t("game.name", @game.name),
      app_name: Rails.env.production? ? t(:appname) : "#{t(:appname)} [#{Rails.env}]",
      azure_speech_service_voices: azure_speech_service_options[:voices],
      disallowed_html_tags: disallowed_html_tags,
      blocklyVersion: params[:blocklyVersion]
    )

    @body_classes = @level.properties['background']

    if [Game::ARTIST, Game::SPRITELAB, Game::POETRY].include? @game.app
      @project_image = CDO.studio_url "/v3/files/#{@view_options['channel']}/.metadata/thumbnail.png", 'https:'
    end

    if params[:key] == 'dance'
      @project_image = CDO.studio_url "v3/files/#{@view_options['channel']}/.metadata/thumbnail.png", 'https:'
      replay_video_view_options unless sharing || readonly
    end

    begin
      _, project_id = storage_decrypt_channel_id(params[:channel_id]) if params[:channel_id]
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      # continue as normal, as we only use this value for stats.
    end

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'project-views',
        event: project_view_event_type(iframe_embed, sharing),
        # allow cross-referencing with the projects table.
        project_id: project_id,
        # make it easier to group by project_type.
        data_string: params[:key],
        data_json: {
          # not currently used, but may prove useful to have in the data later.
          encrypted_channel_id: params[:channel_id],
          # record type again to make it clear what data_string represents.
          project_type: params[:key],
        }.to_json
      }
    )
    render 'levels/show'
  end

  def edit
    return if redirect_under_13_without_tos_teacher(@level)
    show
  end

  def remix
    return if redirect_under_13_without_tos_teacher(@level)
    src_channel_id = params[:channel_id]
    begin
      _, remix_parent_id = storage_decrypt_channel_id(src_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return head :bad_request
    end
    project_type = params[:key]
    return head :forbidden if Projects.in_restricted_share_mode(src_channel_id, project_type)

    new_channel_id = ChannelToken.create_channel(
      request.ip,
      Projects.new(get_storage_id),
      src: src_channel_id,
      type: project_type,
      remix_parent_id: remix_parent_id,
    )
    AssetBucket.new.copy_files src_channel_id, new_channel_id if uses_asset_bucket?(project_type)
    AssetBucket.new.copy_level_starter_assets src_channel_id, new_channel_id if uses_starter_assets?(project_type)
    animation_list = uses_animation_bucket?(project_type) ? AnimationBucket.new.copy_files(src_channel_id, new_channel_id) : []
    SourceBucket.new.remix_source src_channel_id, new_channel_id, animation_list
    FileBucket.new.copy_files src_channel_id, new_channel_id if uses_file_bucket?(project_type)
    redirect_to action: 'edit', channel_id: new_channel_id
  end

  def can_publish_age_status
    project = Project.find_by_channel_id(params[:channel_id])
    unless project.apply_project_age_publish_limits?
      return render json: {
        project_existed_long_enough_to_publish: true,
        user_existed_long_enough_to_publish: true
      }
    end

    render json: {
      project_existed_long_enough_to_publish: project.existed_long_enough_to_publish?,
      user_existed_long_enough_to_publish: project.owner_existed_long_enough_to_publish?
    }
  end

  def export_create_channel
    return if redirect_under_13_without_tos_teacher(@level)
    src_channel_id = params[:channel_id]
    begin
      _, remix_parent_id = storage_decrypt_channel_id(src_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return head :bad_request
    end
    project = Projects.new(get_storage_id)
    src_data = project.get(src_channel_id)
    data = initial_data
    data['name'] = "Exported: #{src_data['name']}"
    data['hidden'] = true
    new_channel_id = ChannelToken.create_channel(
      request.ip,
      project,
      data: data,
      type: params[:key],
      remix_parent_id: remix_parent_id,
      standalone: false,
    )
    render json: {channel_id: new_channel_id}
  end

  def datablock_storage_options
    {}
  end

  def export_config
    return if redirect_under_13_without_tos_teacher(@level)
    if params[:script_call]
      render js: "#{params[:script_call]}(#{datablock_storage_options.to_json});"
    else
      render json: datablock_storage_options
    end
  end

  def set_level
    @level = get_from_cache STANDALONE_PROJECTS[params[:key]][:name]
    @game = @level.game
  end

  # GET /projects/:channel_id/extra_links
  # Get the extra links for the project for use by project validators.
  # This is used by lab2 levels that cannot use the haml 'extra links' box since
  # this box will not refresh when changing levels.
  def extra_links
    src_channel_id = params[:channel_id]
    if src_channel_id == "undefined"
      return render json: {message: 'No channel id provided.'}, status: :ok
    end
    project_info = {}
    owner_info = {}
    owner_info['storage_id'], project_info['id'] = storage_decrypt_channel_id(src_channel_id)
    project_info['sources_link'] = "https://s3.console.aws.amazon.com/s3/buckets/#{CDO.sources_s3_bucket}/#{CDO.sources_s3_directory}/#{owner_info['storage_id']}/#{project_info['id']}/"
    # For legacy labs, other links are displayed.
    # App Lab includes assets, Gamelab includes animations, and Weblab includes files.
    # Follow-up includes adding links other than sources for lab2 labs.
    owner_info['name'] = User.find_channel_owner(src_channel_id).try(:username)
    project_info['is_featured_project'] = FeaturedProject.exists?(storage_app_id: project_info['id'])

    remix_ancestry = Projects.remix_ancestry(src_channel_id, depth: 5)
    project_info['remix_ancestry'] = []
    project_type = Project.find_by_channel_id(src_channel_id)['project_type']
    if remix_ancestry.present?
      remix_ancestry.each do |channel_id|
        project_info['remix_ancestry'] << "/projects/#{project_type}/#{channel_id}/view"
      end
    end
    if project_info['is_featured_project']
      project = FeaturedProject.find_by project_id: project_info['id']
      project_info['featured_status'] = project.status
    else
      project_info['featured_status'] = 'n/a'
    end
    return render json: {owner_info: owner_info, project_info: project_info}
  end

  # Automatically catch authorization exceptions on any methods in this controller
  # Overrides handler defined in application_controller.rb.
  # Special for projects controller - when forbidden, redirect to home instead
  # of returning a 403.
  rescue_from CanCan::AccessDenied do
    if current_user
      # Logged in and trying to reach a forbidden page - redirect to home.
      redirect_to '/'
    else
      # Not logged in and trying to reach a forbidden page - redirect to sign in.
      authenticate_user!
    end
  end

  private def initial_data
    data = {
      name: 'Untitled Project',
      level: polymorphic_url([params[:key].to_sym, :project_projects])
    }
    default_image_url = STANDALONE_PROJECTS[params[:key]][:default_image_url]
    data[:thumbnailUrl] = default_image_url if default_image_url
    data
  end

  private def uses_asset_bucket?(project_type)
    %w(applab makerlab gamelab spritelab javalab).include? project_type
  end

  private def uses_animation_bucket?(project_type)
    projects_that_use_animations = ['gamelab']
    poetry_subtypes = Poetry.standalone_app_names.map {|item| item[1]}
    spritelab_subtypes = GamelabJr.standalone_app_names.map {|item| item[1]}
    projects_that_use_animations.concat(poetry_subtypes)
    projects_that_use_animations.concat(spritelab_subtypes)
    projects_that_use_animations.include?(project_type)
  end

  private def uses_file_bucket?(project_type)
    %w(weblab).include? project_type
  end

  private def uses_starter_assets?(project_type)
    %w(javalab applab).include? project_type
  end

  # @param iframe_embed [Boolean] Whether the project view event was via iframe.
  # @param sharing [Boolean] Whether the project view event was via share page.
  # @returns [String] A string representing the project view event type.
  private def project_view_event_type(iframe_embed, sharing)
    if iframe_embed
      'iframe_embed'
    elsif sharing
      'share'
    else
      'view'
    end
  end

  private def get_from_cache(key)
    if Unit.should_cache?
      @@project_level_cache[key] ||= Level.find_by_key(key)
    else
      Level.find_by_key(key)
    end
  end

  # For certain actions, check a special permission before proceeding.
  private def authorize_load_project!
    authorize! :load_project, params[:key]
  end

  # Redirect to the correct view/edit page for Lab2 projects. If a project owner is on a /view
  # page, redirect to /edit. If a non-owner is on an /edit page, redirect to /view.
  # For legacy (non-Lab2) labs, this is handled on the front-end.
  private def redirect_edit_view_for_lab2
    return nil unless @level.uses_lab2?

    project = Projects.new(get_storage_id).get(params[:channel_id])
    is_owner = project[:isOwner]
    is_frozen = project[:frozen]

    return redirect_to "/projects/#{params[:key]}/#{params[:channel_id]}/edit" if is_owner && request.path.ends_with?('/view') && !is_frozen
    return redirect_to "/projects/#{params[:key]}/#{params[:channel_id]}/view" if is_frozen && request.path.ends_with?('/edit')
    return redirect_to "/projects/#{params[:key]}/#{params[:channel_id]}/view" if !is_owner && request.path.ends_with?('/edit')
  end

  private def set_lab2_responsive_view_options(sharing)
    return nil unless @level.uses_lab2?

    # If the user is on the play view '/projects/channel_id', set `response_content`.`
    if sharing == true
      view_options(responsive_content: true)
    end
  end
end
