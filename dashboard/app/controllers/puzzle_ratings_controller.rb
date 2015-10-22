class PuzzleRatingsController < ApplicationController
  def create
    status_code = :unauthorized
    if PuzzleRating.enabled? && current_user
      valid_request = PuzzleRating.create(
        script_id: params[:script_id],
        level_id: params[:level_id],
        user_id: current_user.id,
        rating: params[:rating],
      ).valid?
      status_code = valid_request ? :created : :bad_request
    end
    head status_code
  end
end
