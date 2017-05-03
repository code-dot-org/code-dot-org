require 'active_support/core_ext/hash/indifferent_access'

class ProjectsController < ApplicationController
  before_action :authenticate_user!, except: [:load, :create_new, :show, :edit, :readonly, :redirect_legacy]
  before_action :authorize_load_project!, only: [:load, :create_new, :edit, :remix]
  before_action :set_level, only: [:load, :create_new, :show, :edit, :readonly, :remix]
  include LevelsHelper

  TEMPLATES = %w(projects).freeze

  STANDALONE_PROJECTS = {
    artist: {
      name: 'New Artist Project'
    },
    playlab: {
      name: 'New Play Lab Project'
    },
    starwars: {
      name: 'New Star Wars Project'
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
    weblab: {
      name: 'New Web Lab Project',
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
  }.with_indifferent_access.freeze

  @@project_level_cache = {}

  def index
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
  end

  # Renders a <script> tag with JS to redirect /p/:key#:channel_id/:action to /projects/:key/:channel_id/:action.
  def redirect_legacy
    render layout: nil
  end

  def angular
    render template: "projects/projects", layout: nil
  end

  def load
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    return if redirect_under_13_without_tos_teacher(@level)
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
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    return if redirect_under_13_without_tos_teacher(@level)
    redirect_to action: 'edit', channel_id: ChannelToken.create_channel(
      request.ip,
      StorageApps.new(storage_id('user')),
      {
        name: 'Untitled Project',
        useFirebase: use_firebase,
        level: polymorphic_url([params[:key], 'project_projects'])
      }
    )
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
    else
      # the age restriction is handled in the front-end for iframe embeds.
      return if redirect_under_13_without_tos_teacher(@level)
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
      code_studio_logo: @is_legacy_share && !iframe_embed,
      no_header: sharing,
      is_legacy_share: @is_legacy_share,
      small_footer: !no_footer && (@game.uses_small_footer? || @level.enable_scrolling?),
      has_i18n: @game.has_i18n?,
      game_display_name: data_t("game.name", @game.name)
    )
    if params[:key] == 'artist'
      @project_image = CDO.studio_url "/v3/files/#{@view_options['channel']}/_share_image.png", 'https:'
    end
    render 'levels/show'
  end

  def edit
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    show
  end

  def remix
    if current_user.try(:admin)
      redirect_to '/', flash: {alert: 'Labs not allowed for admins.'}
      return
    end
    src_channel_id = params[:channel_id]
    new_channel_id = ChannelToken.create_channel(
      request.ip,
      StorageApps.new(storage_id('user')),
      nil,
      src_channel_id,
      use_firebase
    )
    AssetBucket.new.copy_files src_channel_id, new_channel_id
    AnimationBucket.new.copy_files src_channel_id, new_channel_id
    SourceBucket.new.copy_files src_channel_id, new_channel_id
    FileBucket.new.copy_files src_channel_id, new_channel_id
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
