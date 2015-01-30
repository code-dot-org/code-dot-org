class ProjectsController < ApplicationController
  before_filter :authenticate_user!
  check_authorization

  def index
    authorize! :read, :reports
  end

  def template
    authorize! :read, :reports
    render template: "projects/" + params[:template], layout: nil
  end
end
