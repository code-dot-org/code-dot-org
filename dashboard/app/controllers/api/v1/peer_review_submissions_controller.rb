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

    case params[:filter]
      when 'escalated'
        reviews = PeerReview.escalated.limit(50)
      when 'open'
        reviews = PeerReview.where(reviewer: nil).limit(50)
      else
        reviews = PeerReview.all.limit(50)
    end

    reviews.each do |review|
      submissions[review.user_level.id] = review.submission_summarize
    end

    render json: submissions.values
  end
end
