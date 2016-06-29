class PeerReviewsController < ApplicationController
  load_and_authorize_resource

  def index
    @available = @peer_reviews.where(reviewer: nil)
    @submitted = @peer_reviews.where(reviewer: current_user)
  end

  def show
    @level = @peer_review.level
    @user = @peer_review.submitter
    @last_attempt = @peer_review.level_source.data
    view_options full_width: true
  end

  def update
    if @peer_review.update(peer_review_params.merge(reviewer: current_user))
      flash[:notice] = 'Your peer review was submitted'
      redirect_to action: :index
    else
      render action: :show
    end
  end

  private

  def peer_review_params
    params.require(:peer_review).permit(:data, :status)
  end
end
