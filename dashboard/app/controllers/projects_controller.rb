class ProjectsController < ApplicationController
  before_filter :authenticate_user!, except: [:show, :edit, :readonly]
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
    }
  }

  def index
  end

  def template
    # sanitize user input by whitelisting templates we are willing to render
    head :not_found and return unless TEMPLATES.include? params[:template]

    render template: "projects/#{params[:template]}", layout: nil
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
        no_padding: browser.mobile? && @game.share_mobile_fullscreen?
    )
    render 'levels/show'
  end

  def edit
    if STANDALONE_PROJECTS[params[:key]][:login_required]
      authenticate_user!
    end
    show
  end

  def remix
    if STANDALONE_PROJECTS[params[:key]][:login_required]
      authenticate_user!
    end
    new_channel_id = create_channel('', params[:channel_id])
    redirect_to action: 'edit', channel_id: new_channel_id
  end

  def set_level
    @level = Level.find_by_key STANDALONE_PROJECTS[params[:key]][:name]
    @game = @level.game
  end
end
