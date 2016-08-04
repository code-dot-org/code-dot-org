require 'active_support/core_ext/hash/indifferent_access'

class ProjectsController < ApplicationController
  before_filter :authenticate_user!, except: [:load, :create_new, :show, :edit, :readonly, :redirect_legacy]
  before_filter :authorize_load_project!, only: [:load, :create_new, :edit, :remix]
  before_action :set_level, only: [:load, :create_new, :show, :edit, :readonly, :remix]
  include LevelsHelper

  TEMPLATES = %w(projects)

  STANDALONE_PROJECTS = {
    artist: {
      name: 'New Artist Project'
    },
    playlab: {
      name: 'New Play Lab Project'
    },
    applab: {
      name: 'New App Lab Project',
      login_required: true
    },
    gamelab: {
      name: 'New Game Lab Project',
      login_required: true,
    },
    makerlab: {
      name: 'New Maker Lab Project',
      login_required: true
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
  }.with_indifferent_access

  @@project_level_cache = {}

  def index
  end

  # Renders a <script> tag with JS to redirect /p/:key#:channel_id/:action to /projects/:key/:channel_id/:action.
  def redirect_legacy
    render layout: nil
  end

  def angular
    render template: "projects/projects", layout: nil
  end

  def load
    return if redirect_under_13(@level)
    if current_user
      channel = StorageApps.new(storage_id_for_user).most_recent(params[:key])
      if channel
        redirect_to action: 'edit', channel_id: channel
        return
      end
    end

    create_new
  end

  def create_new
    return if redirect_under_13(@level)
    redirect_to action: 'edit', channel_id: ChannelToken.create_channel(
      request.ip,
      StorageApps.new(storage_id('user')),
      {
        name: 'Untitled Project',
        useFirebase: use_firebase,
        level: polymorphic_url([params[:key], 'project_projects'])
      })
  end

  def show
    iframe_embed = params[:iframe_embed] == true
    sharing = iframe_embed || params[:share] == true
    readonly = params[:readonly] == true
    if iframe_embed
      # explicitly set security related headers so that this page can actually
      # be embedded.
      response.headers['X-Frame-Options'] = 'ALLOWALL'
      response.headers['Content-Security-Policy'] = ''
    else
      # the age restriction is handled in the front-end for iframe embeds.
      return if redirect_under_13(@level)
    end
    level_view_options(
      @level.id,
      hide_source: sharing,
      share: sharing,
      iframe_embed: iframe_embed,
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
      code_studio_logo: @is_legacy_share,
      no_header: sharing,
      is_legacy_share: @is_legacy_share,
      small_footer: !no_footer && (@game.uses_small_footer? || @level.enable_scrolling?),
      has_i18n: @game.has_i18n?,
      game_display_name: data_t("game.name", @game.name)
    )
    render 'levels/show'
  end

  def edit
    show
  end

  def remix
    src_channel_id = params[:channel_id]
    new_channel_id = ChannelToken.create_channel(
      request.ip,
      StorageApps.new(storage_id('user')),
      nil,
      src_channel_id,
      use_firebase)
    AssetBucket.new.copy_files src_channel_id, new_channel_id
    AnimationBucket.new.copy_files src_channel_id, new_channel_id
    SourceBucket.new.copy_files src_channel_id, new_channel_id
    redirect_to action: 'edit', channel_id: new_channel_id
  end

  def set_level
    @level = get_from_cache STANDALONE_PROJECTS[params[:key]][:name]
    @game = @level.game
  end

  private

  def get_from_cache(key)
    @@project_level_cache[key] ||= Level.find_by_key(key)
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
