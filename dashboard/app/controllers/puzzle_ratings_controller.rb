class PuzzleRatingsController < ApplicationController
  def create
    status_code = :unauthorized
    if PuzzleRating.enabled?
      valid_request = PuzzleRating.create(
        script_id: params[:script_id],
        level_id: params[:level_id],
        user: current_user,
        rating: params[:rating],
      ).valid?
      status_code = valid_request ? :created : :bad_request
    end
    head status_code
  end
end
