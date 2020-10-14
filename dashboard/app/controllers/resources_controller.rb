class ResourcesController < ApplicationController
  # GET /resourcesearch/:q/:limit
  def search
    # TODO: use the query to provide real suggestions
    render json: Resource.limit(params[:limit]).map(&:attributes)
  end
end
