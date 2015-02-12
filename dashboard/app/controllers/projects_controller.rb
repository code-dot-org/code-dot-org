class ProjectsController < ApplicationController
  before_filter :authenticate_user!, except: [:new]
  check_authorization
  include LevelsHelper

  TEMPLATES = %w(projects)
  APPS = {
    artist: 'New Artist Project',
    playlab: 'New Playlab Project',
  }.with_indifferent_access

  def index
    authorize! :read, :reports
  end

  def template
    authorize! :read, :reports

    # sanitize user input by whitelisting templates we are willing to render
    head :not_found and return unless TEMPLATES.include? params[:template]

    render template: "projects/#{params[:template]}", layout: nil
  end

  def new
    authorize! :read, :level
    @full_width = true
    @level = Level.find_by_key APPS[params[:app]]
    @game = @level.game

    set_videos_and_blocks_and_callouts_and_instructions

    render 'levels/show'
  end
end
