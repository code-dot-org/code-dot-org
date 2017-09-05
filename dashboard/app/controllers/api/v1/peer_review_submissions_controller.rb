class Api::V1::PeerReviewSubmissionsController < ApplicationController
  authorize_resource class: :peer_review_submissions
  # GET /api/v1/peer_review_submissions/index_escalated
  def index_escalated
    # Get a list of submissions that have been escalated
    # This will return an array of objects containing
    # - Submitter
    # - Course name
    # - Unit
    # - Level name
    # - Submission date
    # - Date it was escalated
    # - ID of review

    escalated_submissions = Hash.new

    escalated_reviews = PeerReview.escalated.limit(50)

    escalated_reviews.each do |review|
      plc_course_unit = review.script.plc_course_unit

      escalated_submissions[review.user_level.id] = {
        submitter: review.submitter.name,
        course_name: plc_course_unit.plc_course.name,
        unit_name: plc_course_unit.name,
        level_name: review.level.name,
        submission_date: review.created_at,
        escalated_date: review.updated_at,
        review_id: review.id
      }
    end

    # We now have information for each user_level - no need to return the hash, just
    # return the values
    render json: escalated_submissions.values
  end
end
