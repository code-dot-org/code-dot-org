class ResourcesController < ApplicationController
  # GET /resourcesearch/:q/:limit
  def search
    render json: ResourcesAutocomplete.get_search_matches(params[:q], params[:limit])
  end
end
