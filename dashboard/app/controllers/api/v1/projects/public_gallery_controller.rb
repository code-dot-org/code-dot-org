class Api::V1::Projects::PublicGalleryController < ApplicationController
  # GET /api/v1/projects/gallery/public/<project_type>/<limit>[/<published_before>]
  def index
    unless Rails.env.test? || Rails.env.development?
      expires_in 5.seconds, public: true # cache
    end

    render json: ProjectsList.fetch_published_projects(
      params[:project_type],
      limit: params[:limit],
      published_before: params[:published_before]
    )
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end
end
