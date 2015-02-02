class ProjectsController < ApplicationController
  before_filter :authenticate_user!
  check_authorization

  def index
    authorize! :read, :reports
  end

  TEMPLATES = %w(projects)
  def template
    authorize! :read, :reports

    # sanitize user input by whitelisting templates we are willing to render
    head :not_found and return unless TEMPLATES.include? params[:template]

    render template: "projects/#{params[:template]}", layout: nil
  end
end
