class PeerReviewsController < ApplicationController
  load_and_authorize_resource

  def index
    @peer_reviews = @peer_reviews.where(script_id: params[:script_id])
  end

  def show
    @level = @peer_review.level
    @last_attempt = @peer_review.level_source.data
    view_options readonly_workspace: true, full_width: true
  end

  private

  def peer_review_params
    params.permit(:script_id)
  end
end
