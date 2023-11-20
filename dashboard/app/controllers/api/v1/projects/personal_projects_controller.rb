class Api::V1::Projects::PersonalProjectsController < ApplicationController
  # GET /api/v1/projects/personal/
  def index
    prevent_caching
    return head :forbidden unless current_user
    render json: ProjectsList.fetch_personal_projects(current_user.id)
  rescue ArgumentError => exception
    render json: {error: exception.message}, status: :bad_request
  end
end
