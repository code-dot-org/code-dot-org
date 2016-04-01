require 'active_support/core_ext/hash/indifferent_access'

class ProjectsController < ApplicationController
  before_filter :authenticate_user!, except: [:load, :create_new, :show, :edit, :readonly, :redirect_legacy]
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
      admin_required: true,
      login_required: true
    },
    makerlab: {
      name: 'New Maker Lab Project',
      admin_required: true,
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
    return if redirect_if_admin_required_and_not_admin
    if STANDALONE_PROJECTS[params[:key]][:login_required]
      authenticate_user!
    end
    return if redirect_applab_under_13(@level)
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
    return if redirect_if_admin_required_and_not_admin
    return if redirect_applab_under_13(@level)
    redirect_to action: 'edit', channel_id: create_channel({
      name: 'Untitled Project',
      level: polymorphic_url([params[:key], 'project_projects'])
    })
  end

  def show
    return if redirect_applab_under_13(@level)
    sharing = params[:share] == true
    readonly = params[:readonly] == true
    level_view_options(
        hide_source: sharing,
        share: sharing,
    )
    # for sharing pages, the app will display the footer inside the playspace instead
    no_footer = sharing && @game.owns_footer_for_share?
    view_options(
      readonly_workspace: sharing || readonly,
      full_width: true,
      callouts: [],
      channel: params[:channel_id],
      no_footer: no_footer,
      small_footer: !no_footer && (@game.uses_small_footer? || enable_scrolling?),
      has_i18n: @game.has_i18n?,
      game_display_name: data_t("game.name", @game.name)
    )
    render 'levels/show'
  end

  def edit
    return if redirect_if_admin_required_and_not_admin
    if STANDALONE_PROJECTS[params[:key]][:login_required]
      authenticate_user!
    end
    show
  end

  def remix
    return if redirect_if_admin_required_and_not_admin
    if STANDALONE_PROJECTS[params[:key]][:login_required]
      authenticate_user!
    end
    src_channel_id = params[:channel_id]
    new_channel_id = create_channel nil, src_channel_id
    AssetBucket.new.copy_files src_channel_id, new_channel_id
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

  # Redirect to home if user not authenticated
  def redirect_if_admin_required_and_not_admin
    if STANDALONE_PROJECTS[params[:key]][:admin_required] && !current_user.try(:admin?)
      redirect_to '/'
      true
    end
  end
end
