class ProjectsController < ApplicationController
  before_filter :authenticate_user!
  include LevelsHelper

  TEMPLATES = %w(projects)

  STANDALONE_PROJECTS = {
    artist: 'New Artist Project',
    playlab: 'New Play Lab Project',
    applab: 'New App Lab Project',
    algebra_game: 'New Algebra Project',
    calc: 'Calc Free Play',
    eval: 'Eval Free Play'
  }

  def index
  end

  def template
    # sanitize user input by whitelisting templates we are willing to render
    head :not_found and return unless TEMPLATES.include? params[:template]

    render template: "projects/#{params[:template]}", layout: nil
  end
end
