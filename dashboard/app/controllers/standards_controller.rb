class StandardsController < ApplicationController
  # GET /standards/search
  def search
    render json: StandardsAutocomplete.get_search_matches(params[:query], params[:limit], params[:frameworkId])
  end
end
