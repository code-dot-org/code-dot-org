class CensusReviewersController < ApplicationController
  authorize_resource class: "Census::CensusInaccuracyInvestigation"

  def create
    submission = Census::CensusSubmission.find_by(id: params[:census_submission_id])
    if submission.nil?
      return render json: {error_message: "Invalid census_submission_id (#{params[:census_submission_id]})"},
        status: :bad_request
    end

    if params[:override].presence
      override = Census::CensusOverride.new(
        school: submission.school_infos.first.school,
        school_year: submission.school_year,
        teaches_cs: params[:override],
      )
      unless override.valid?
        return render json: {
          error_message: "Unable to create CensusOverride",
          errors: override.errors,
        }, status: :bad_request
      end
    end

    investigation = Census::CensusInaccuracyInvestigation.new(
      user: current_user,
      notes: params[:notes],
      census_submission: submission,
      census_override: override,
    )
    unless investigation.valid?
      return render json: {
        error_message: "Unable to create CensusInaccuracyInvestigation",
        errors: investigation.errors,
      }, status: :bad_request
    end
    investigation.save!

    render json: {
      census_inaccuracy_investigation_id: investigation.id,
      census_override_id: override.try(:id),
    }, status: :created
  end

  def review_reported_inaccuracies
    @unit_data = {}
    @unit_data[:authenticityToken] = form_authenticity_token
    inaccuracy_reports = Census::CensusSubmission.unresolved_reported_inaccuracies
    @unit_data[:reportsToReview] = inaccuracy_reports.map(&:inaccuracy_review_data).flatten.compact.map(&:to_json)
  end
end
