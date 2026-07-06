class Api::V1::ProjectsController < ApplicationController
  # GET /api/v1/projects/:type/level_properties
  def level_properties
    project_type = ProjectsController::STANDALONE_PROJECTS[params[:type]]
    return head :forbidden unless project_type
    level = Level.find_by_key(project_type[:name])
    return head :forbidden unless level
    properties = {}
    properties[level.id] = level.summarize_for_lab2_properties(nil, nil, current_user)
    render json: properties
  end
end
