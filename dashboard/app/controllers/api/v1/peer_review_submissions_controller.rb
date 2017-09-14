class Api::V1::PeerReviewSubmissionsController < ApplicationController
  authorize_resource class: :peer_review_submissions
  # All calls here will return an array of objects containing
  # - Submitter
  # - Course name
  # - Unit
  # - Level name
  # - Submission date
  # - Date it was escalated
  # - ID of review

  def index
    # Get a list of submissions that are currently open
    submissions = Hash.new
    limit = params[:limit] || 50

    case params[:filter]
      when 'escalated'
        reviews = PeerReview.escalated.limit(limit)
      when 'open'
        reviews = PeerReview.where(reviewer: nil).limit(limit)
      else
        reviews = PeerReview.all.limit(limit)
    end

    reviews.each do |review|
      submissions[review.user_level.id] = review.submission_summarize
    end

    render json: submissions.values
  end
end
