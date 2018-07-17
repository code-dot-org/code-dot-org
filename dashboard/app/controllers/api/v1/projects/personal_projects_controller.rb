class Api::V1::Projects::PersonalProjectsController < ApplicationController
  # GET /api/v1/projects/personal/<user_id>
  def index
    render json: ProjectsList.fetch_personal_projects(
      params[:user_id],
    )
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end
end
