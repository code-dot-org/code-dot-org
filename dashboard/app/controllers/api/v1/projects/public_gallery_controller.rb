class Api::V1::Projects::PublicGalleryController < ApplicationController
  # GET /api/v1/projects/gallery/public/<project_type>/<limit>[/<published_before>]
  def index
    unless Rails.env.test? || Rails.env.development?
      expires_in 5.seconds, public: true # cache
    end

    render json: ProjectsList.fetch_active_published_featured_projects(
      params[:project_type],
    )
  rescue ArgumentError => exception
    render json: {error: exception.message}, status: :bad_request
  end
end
