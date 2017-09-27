class Api::V1::PeerReviewSubmissionsController < ApplicationController
  include Api::CsvDownload
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
        reviews = PeerReview.escalated.where(reviewer: nil).limit(limit)
      when 'open'
        reviews = PeerReview.where(reviewer: nil).limit(limit)
      else
        reviews = PeerReview.all.limit(limit)
    end

    if params[:email].presence
      reviews = reviews.where(submitter: User.find_by_email(params[:email]))
    elsif params[:plc_course_id].presence
      reviews = reviews.where(script: Plc::Course.find(params[:plc_course_id]).plc_course_units.map(&:script))
    end

    reviews.distinct! {|review| [review.submitter, review.level]}

    reviews.each do |review|
      submissions[review.user_level.id] = PeerReview.get_submission_summary_for_user_level(review.user_level, review.script)
    end

    render json: submissions.values
  end

  def report_csv
    enrollments = Plc::UserCourseEnrollment.where(plc_course_id: params[:plc_course_id])
    enrollment_submissions = Hash.new

    scripts = Plc::Course.find(params[:plc_course_id]).plc_course_units.map(&:script)
    peer_reviewable_levels = ScriptLevel.where(script: scripts).select {|sl| sl.level.try(:peer_reviewable?)}.map(&:level).uniq

    enrollments.each do |enrollment|
      peer_review_submissions = Hash.new

      UserLevel.where(user: enrollment.user, level: peer_reviewable_levels).each do |user_level|
        peer_review_submissions[user_level.level.name] = {
          status: result_to_status(user_level.best_result),
          date: user_level.created_at.strftime("%-m/%-d/%Y")
        }
      end

      enrollment_submissions[enrollment.user_id] = {
        name: enrollment.user.name,
        submissions: peer_review_submissions,
        reviews_performed: PeerReview.where(reviewer_id: enrollment.user_id, script: scripts).count
      }
    end

    response_body = enrollment_submissions.values.map do |enrollment_submission|
      {}.tap do |row|
        row[:name] = enrollment_submission[:name]

        peer_reviewable_levels.each do |level|
          if enrollment_submission[:submissions].key? level.name
            submission = enrollment_submission[:submissions][level.name]
            row[level.name] = submission[:status]
            row["#{level.name} submit date"] = submission[:date]
          else
            row[level.name] = 'Unsubmitted'
            row["#{level.name} submit date"] = ''
          end
        end

        row[:reviews_performed] = enrollment_submission[:reviews_performed]
      end
    end

    send_as_csv_attachment response_body, "#{Plc::Course.find(params[:plc_course_id]).name}_peer_review_report.csv"
  end

  private

  def result_to_status(result)
    case result
      when ActivityConstants::REVIEW_ACCEPTED_RESULT
        'Accepted'
      when ActivityConstants::REVIEW_REJECTED_RESULT
        'Rejected'
      when ActivityConstants::UNREVIEWED_SUBMISSION_RESULT
        'Pending Review'
      else
        'Unsubmitted'
    end
  end
end
