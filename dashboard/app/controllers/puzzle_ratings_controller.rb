class PuzzleRatingsController < ApplicationController
  def create
    return head :unauthorized unless PuzzleRating.enabled?

    valid_request = retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      PuzzleRating.create(
        script_id: params[:script_id],
        level_id: params[:level_id],
        user: current_user,
        rating: params[:rating]
      ).valid?
    end

    status_code = valid_request ? :created : :bad_request
    head status_code
  end
end
