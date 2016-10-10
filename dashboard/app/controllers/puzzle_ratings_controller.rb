class PuzzleRatingsController < ApplicationController
  # Don't require an authenticity token because we post to this controller
  # from publicly cached level pages without valid tokens.
  skip_before_action :verify_authenticity_token

  def create
    return head :unauthorized unless PuzzleRating.enabled?

    valid_request = Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
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
