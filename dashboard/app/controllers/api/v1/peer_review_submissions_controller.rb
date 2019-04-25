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

  # GET /api/v1/peer_review_submissions/index
  #
  # Optional queryparams:
  #   page:               Which page of results to return.  Default: 1 (first page)
  #   per -or- limit:     How many results to return. Default: 50. Maximum: 500
  #   emailFilter:        Filters results by submitter email
  #   plc_course_id:      Filters results by course id
  #   plc_course_unit_id: Filters results by unit id
  def index
    # Get a list of submissions that are currently open
    submissions = Hash.new
    page = params[:page] || 1
    per = params[:per] || params[:limit] || 50

    reviews = PeerReview.all

    if params[:email].presence
      reviews = reviews.where(submitter: User.find_by_email(params[:email]))
    end

    if params[:plc_course_unit_id].presence
      reviews = reviews.where(script: Plc::CourseUnit.find(params[:plc_course_unit_id]).script)
    elsif params[:plc_course_id].presence
      reviews = reviews.where(script: Plc::Course.find(params[:plc_course_id]).plc_course_units.map(&:script))
    end

    reviews = reviews.distinct {|review| [review.submitter, review.level]}

    reviews = reviews.page(page).per(per)

    reviews.each do |review|
      submissions[review.user_level.id] = PeerReview.get_submission_summary_for_user_level(review.user_level, review.script)
    end

    render json: {
      submissions: submissions.values,
      pagination: {
        total_pages: reviews.total_pages,
        current_page: reviews.current_page
      }
    }
  end

  def report_csv
    course_unit = Plc::CourseUnit.find(params[:plc_course_unit_id])
    enrollments = Plc::EnrollmentUnitAssignment.where(plc_course_unit: course_unit)
    enrollment_submissions = Hash.new

    script = Plc::CourseUnit.find(params[:plc_course_unit_id]).script
    peer_reviewable_levels = ScriptLevel.where(script: script).select {|sl| sl.level.try(:peer_reviewable?)}.map(&:level).uniq

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
        email: enrollment.user.email,
        submissions: peer_review_submissions,
        reviews_performed: PeerReview.where(reviewer_id: enrollment.user_id, script: script).count
      }
    end

    response_body = enrollment_submissions.values.map do |enrollment_submission|
      {}.tap do |row|
        row[:name] = enrollment_submission[:name]
        row[:email] = enrollment_submission[:email]

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

    send_as_csv_attachment response_body, "#{course_unit.name}_peer_review_report.csv"
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
