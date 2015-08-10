class ProjectsController < ApplicationController
  before_filter :authenticate_user!, except: [:show, :edit, :readonly, :redirect_legacy]
  before_action :set_level, only: [:show, :edit, :readonly, :remix]
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
    algebra_game: {
      name: 'New Algebra Project'
    },
    calc: {
      name: 'Calc Free Play'
    },
    eval: {
      name: 'Eval Free Play'
    }
  }

  def index
  end

  # Renders a <script> tag with JS to redirect /p/:key#:channel_id/:action to /projects/:key/:channel_id/:action.
  def redirect_legacy
    render layout: nil
  end

  def angular
    render template: "projects/projects", layout: nil
  end

  def show
    sharing = params[:share] == true
    level_view_options(
        hide_source: sharing,
        share: sharing
    )
    view_options(
        readonly_workspace: sharing || params[:readonly],
        full_width: true,
        no_footer: !@game.has_footer?,
        callouts: [],
        no_padding: browser.mobile? && @game.share_mobile_fullscreen?,
        small_footer: @game.uses_small_footer? || enable_scrolling?
    )
    render 'levels/show'
  end

  def edit
    if STANDALONE_PROJECTS[params[:key].to_sym][:login_required]
      authenticate_user!
    end
    show
  end

  def remix
    if STANDALONE_PROJECTS[params[:key].to_sym][:login_required]
      authenticate_user!
    end
    src_channel_id = params[:channel_id]
    new_channel_id = create_channel nil, src_channel_id
    AssetBucket.new.copy_assets src_channel_id, new_channel_id
    redirect_to action: 'edit', channel_id: new_channel_id
  end

  def set_level
    @level = Level.find_by_key STANDALONE_PROJECTS[params[:key].to_sym][:name]
    @game = @level.game
  end
end
