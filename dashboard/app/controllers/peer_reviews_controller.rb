class PeerReviewsController < ApplicationController
  load_and_authorize_resource except: :pull_review

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

  def pull_review
    script = Script.find_by_name(params[:script_id])
    peer_review = PeerReview.pull_review_from_pool(script, current_user)

    if peer_review
      redirect_to peer_review_path(peer_review)
    else
      flash[:notice] = 'There are no peer reviews available at this moment, please check back soon'
      redirect_to script_path(script)
    end
  end

  def update
    if @peer_review.update(peer_review_params.merge(reviewer: current_user))
      flash[:notice] = 'Your peer review was submitted'
      redirect_to script_path(@peer_review.script)
    else
      render action: :show
    end
  end

  private

  def peer_review_params
    params.require(:peer_review).permit(:data, :status)
  end
end
