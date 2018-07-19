class Api::V1::Projects::PersonalProjectsController < ApplicationController
  # GET /api/v1/projects/personal/
  def index
    unless current_user
      redirect_to "/", flash: {alert: 'You must be logged in to access your projects'}
      return
    end
    render json: ProjectsList.fetch_personal_projects(current_user.id)
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end
end
