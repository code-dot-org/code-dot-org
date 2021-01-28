class VocabulariesController < ApplicationController
  # GET /vocabularysearch
  def search
    render json: VocabularyAutocomplete.get_search_matches(params[:query], params[:limit], params[:courseVersionId])
  end
end
