class PeerReviewsController < ApplicationController
  load_and_authorize_resource

  def index
    @peer_reviews = @peer_reviews.where(script_id: params[:script_id])
  end

  def show
  end

  private

  def peer_review_params
    params.permit(:script_id)
  end
end
