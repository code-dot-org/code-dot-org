class Api::V1::Projects::PersonalProjectsController < ApplicationController
  # GET /api/v1/projects/personal/
  def index
    return head :forbidden unless current_user
    render json: ProjectsList.fetch_personal_projects(current_user.id)
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end
end
