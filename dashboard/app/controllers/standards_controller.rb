class StandardsController < ApplicationController
  # GET /standards/search
  def search
    framework = Framework.find_by(shortcode: params[:framework]) if params[:framework].present?
    render json: StandardsAutocomplete.get_search_matches(params[:query], params[:limit], framework&.id)
  end
end
