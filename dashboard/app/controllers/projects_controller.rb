require 'active_support/core_ext/hash/indifferent_access'
require 'cdo/firehose'

class ProjectsController < ApplicationController
  before_action :authenticate_user!, except: [:load, :create_new, :show, :edit, :readonly, :redirect_legacy, :public, :index]
  before_action :authorize_load_project!, only: [:load, :create_new, :edit, :remix]
  before_action :set_level, only: [:load, :create_new, :show, :edit, :readonly, :remix]
  include LevelsHelper

  TEMPLATES = %w(projects).freeze

  # @type [Hash[Hash]] A map from project type to a hash with the following options
  # representing properties of this project type:
  # @option {String} :name The name of the level to use for this project type.
  # @option {Boolean|nil} :levelbuilder_required Whether you must have
  #   UserPermission::LEVELBUILDER to access this project type. Default: false.
  # @option {Boolean|nil} :login_required Whether you must be logged in to
  #   access this project type. Default: false.
  # @option {String|nil} :default_image_url If present, set this as the
  # thumbnail image url when creating a project of this type.
  STANDALONE_PROJECTS = {
    artist: {
      name: 'New Artist Project'
    },
    artist_k1: {
      name: 'New K1 Artist Project'
    },
    frozen: {
      name: 'New Frozen Project'
    },
    playlab: {
      name: 'New Play Lab Project'
    },
    playlab_k1: {
      name: 'New K1 Play Lab Project'
    },
    starwars: {
      name: 'New Star Wars Project'
    },
    starwarsblocks_hour: {
      name: 'New Star Wars Blocks Project'
    },
    starwarsblocks: {
      name: 'New Star Wars Expanded Blocks Project'
    },
    iceage: {
      name: 'New Ice Age Project'
    },
    infinity: {
      name: 'New Infinity Project'
    },
    gumball: {
      name: 'New Gumball Project'
    },
    flappy: {
      name: 'New Flappy Project',
      # We do not currently generate thumbnails for flappy, so specify a
      # placeholder image here. This allows flappy projects to show up in the
      # public gallery, and to be published from the share dialog.
      default_image_url: '/blockly/media/flappy/placeholder.jpg',
    },
    scratch: {
      name: 'New Scratch Project',
      levelbuilder_required: true,
    },
    minecraft_codebuilder: {
      name: 'New Minecraft Code Connection Project'
    },
    minecraft_adventurer: {
      name: 'New Minecraft Adventurer Project'
    },
    minecraft_designer: {
      name: 'New Minecraft Designer Project'
    },
    minecraft_hero: {
      name: 'New Minecraft Hero Project'
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
    },
    sports: {
      name: 'New Sports Project',
    },
    basketball: {
      name: 'New Basketball Project',
    },
    algebra_game: {
      name: 'New Algebra Project'
    },
    calc: {
      name: 'Calc Free Play'
    },
    eval: {
      name: 'Eval Free Play'
    }
  }.with_indifferent_access.freeze

  @@project_level_cache = {}

  # GET /projects
  def index
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    unless current_user
      redirect_to '/projects/public'
    end
  end

  # GET /projects/public
  def public
    if current_user
      render template: 'projects/index', locals: {is_public: true}
    else
      render template: 'projects/public'
    end
  end

  def project_and_featured_project_fields
    [
      :storage_apps__id___id,
      :storage_apps__storage_id___storage_id,
      :storage_apps__value___value,
      :storage_apps__project_type___project_type,
      :storage_apps__published_at___published_at,
      :featured_projects__featured_at___featured_at,
      :featured_projects__unfeatured_at___unfeatured_at
    ]
  end

  def combine_projects_and_featured_projects_data
    storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
    project_featured_project_combo_data = DASHBOARD_DB[:featured_projects].
      select(*project_and_featured_project_fields).
      join(storage_apps, id: :storage_app_id).all
    extract_data_for_tables(project_featured_project_combo_data)
  end

  def extract_data_for_tables(project_featured_project_combo_data)
    @featured_project_table_rows = []
    project_featured_project_combo_data.each do |project_details|
      project_details_value = JSON.parse(project_details[:value])
      channel = storage_encrypt_channel_id(project_details[:storage_id], project_details[:id])
      featured_project_row = {
        projectName: project_details_value['name'],
        channel: channel,
        type: project_details[:project_type],
        publishedAt: project_details[:published_at],
        thumbnailUrl: project_details_value['thumbnailUrl'],
        featuredAt: project_details[:featured_at],
        unfeaturedAt: project_details[:unfeatured_at],
      }
      @featured_project_table_rows << featured_project_row
    end
    sort_projects(@featured_project_table_rows)
  end

  # @param [Array {Hash}] Each hash is data for a row in the featured projects tables.
  # The rows are sorted into two arrays: featured or unfeatured, based on
  # on whether the project is currently featured or not.
  def sort_projects(featured_project_table_rows)
    @featured = []
    @unfeatured = []
    featured_project_table_rows.each do |row|
      featured = row[:unfeaturedAt].nil? && !row[:featuredAt].nil?
      featured ? @featured << row : @unfeatured << row
    end
  end

  # GET /projects/featured
  # Access is restricted to those with project_validator permission
  def featured
    if current_user && current_user.project_validator?
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

  GALLERY_PER_PAGE = 5

  def angular
    if current_user
      @gallery_activities =
        current_user.gallery_activities.order(id: :desc).page(params[:page]).per(GALLERY_PER_PAGE)
    end
    render template: "projects/projects", layout: nil
  end

  def load
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    return if redirect_under_13_without_tos_teacher(@level)
    if current_user
      channel = StorageApps.new(storage_id_for_current_user).most_recent(params[:key])
      if channel
        redirect_to action: 'edit', channel_id: channel
        return
      end
    end

    create_new
  end

  def create_new
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    return if redirect_under_13_without_tos_teacher(@level)
    channel = ChannelToken.create_channel(
      request.ip,
      StorageApps.new(storage_id('user')),
      data: initial_data,
      type: params[:key]
    )
    redirect_to(
      action: 'edit',
      channel_id: channel,
      enableMaker: params['enableMaker'] ? true : nil
    )
  end

  private def initial_data
    data = {
      name: 'Untitled Project',
      level: polymorphic_url([params[:key], 'project_projects'])
    }
    default_image_url = STANDALONE_PROJECTS[params[:key]][:default_image_url]
    data[:thumbnailUrl] = default_image_url if default_image_url
    data
  end

  def show
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
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

    iframe_embed = params[:iframe_embed] == true
    sharing = iframe_embed || params[:share] == true
    readonly = params[:readonly] == true
    if iframe_embed
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
      project_type: params[:key]
    )
    # for sharing pages, the app will display the footer inside the playspace instead
    no_footer = sharing
    # if the game doesn't own the sharing footer, treat it as a legacy share
    @is_legacy_share = sharing && !@game.owns_footer_for_share?
    view_options(
      readonly_workspace: sharing || readonly,
      full_width: true,
      callouts: [],
      channel: params[:channel_id],
      no_footer: no_footer,
      code_studio_logo: sharing && !iframe_embed,
      no_header: sharing,
      is_legacy_share: @is_legacy_share,
      small_footer: !no_footer && (@game.uses_small_footer? || @level.enable_scrolling?),
      has_i18n: @game.has_i18n?,
      game_display_name: data_t("game.name", @game.name)
    )
    if params[:key] == 'artist'
      @project_image = CDO.studio_url "/v3/files/#{@view_options['channel']}/_share_image.png", 'https:'
    end

    begin
      _, storage_app_id = storage_decrypt_channel_id(params[:channel_id]) if params[:channel_id]
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      # continue as normal, as we only use this value for stats.
    end

    FirehoseClient.instance.put_record(
      study: 'project-views',
      event: project_view_event_type(iframe_embed, sharing),
      # allow cross-referencing with the storage_apps table.
      project_id: storage_app_id,
      # make it easier to group by project_type.
      data_string: params[:key],
      data_json: {
        # not currently used, but may prove useful to have in the data later.
        encrypted_channel_id: params[:channel_id],
        # record type again to make it clear what data_string represents.
        project_type: params[:key],
      }.to_json
    )
    render 'levels/show'
  end

  def edit
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    return if redirect_under_13_without_tos_teacher(@level)
    show
  end

  def remix
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    return if redirect_under_13_without_tos_teacher(@level)
    src_channel_id = params[:channel_id]
    begin
      _, remix_parent_id = storage_decrypt_channel_id(src_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return head :bad_request
    end
    new_channel_id = ChannelToken.create_channel(
      request.ip,
      StorageApps.new(storage_id('user')),
      src: src_channel_id,
      type: params[:key],
      remix_parent_id: remix_parent_id,
    )
    AssetBucket.new.copy_files src_channel_id, new_channel_id
    animation_list = AnimationBucket.new.copy_files src_channel_id, new_channel_id
    SourceBucket.new.remix_source src_channel_id, new_channel_id, animation_list
    FileBucket.new.copy_files src_channel_id, new_channel_id
    redirect_to action: 'edit', channel_id: new_channel_id
  end

  def set_level
    @level = get_from_cache STANDALONE_PROJECTS[params[:key]][:name]
    @game = @level.game
  end

  private

  # @param iframe_embed [Boolean] Whether the project view event was via iframe.
  # @param sharing [Boolean] Whether the project view event was via share page.
  # @returns [String] A string representing the project view event type.
  def project_view_event_type(iframe_embed, sharing)
    if iframe_embed
      'iframe_embed'
    elsif sharing
      'share'
    else
      'view'
    end
  end

  def get_from_cache(key)
    if Script.should_cache?
      @@project_level_cache[key] ||= Level.find_by_key(key)
    else
      Level.find_by_key(key)
    end
  end

  # For certain actions, check a special permission before proceeding.
  def authorize_load_project!
    authorize! :load_project, params[:key]
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
end
