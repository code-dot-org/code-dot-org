class Api::V1::Projects::PublicGalleryController < ApplicationController
  # GET /api/v1/projects/gallery/<project_type>/<limit>
  def index
    render json: ProjectsList.fetch_published_projects(
      params[:project_type],
      limit: params[:limit],
      offset: params[:offset]
    )
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end
end
