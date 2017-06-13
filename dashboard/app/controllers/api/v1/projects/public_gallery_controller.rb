class Api::V1::Projects::PublicGalleryController < ApplicationController
  # GET /api/v1/projects/gallery/public/<project_type>/<limit>[/<published_before>]
  def index
    expires_in 1.minute, public: true # cache

    render json: ProjectsList.fetch_published_projects(
      params[:project_type],
      limit: params[:limit],
      published_before: params[:published_before]
    )
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end
end
