class ProgrammingExpressionsController < ApplicationController
  # GET /programmingexpressionsearch
  def search
    render json: ProgrammingExpressionAutocomplete.get_search_matches(params[:query], params[:limit])
  end
end
