class ProjectsController < ApplicationController
  def index
  end

  def template
    render template: "projects/" + params[:template], layout: nil
  end
end
