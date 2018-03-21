class CensusReviewersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_census_reviewer_permissions

  def require_census_reviewer_permissions
    return if current_user.permission?(UserPermission::CENSUS_REVIEWER)
    raise(CanCan::AccessDenied, 'user must be a census reviewer')
  end

  def create
    begin
      submission = Census::CensusSubmission.find(params[:census_submission_id])
    rescue ActiveRecord::RecordNotFound
      render json: {error_message: "Invalid census_submission_id (#{params[:census_submission_id]})"},
             status: :bad_request
      return
    end

    if params[:override].presence
      override = Census::CensusOverride.new(
        school: submission.school_infos.first.school,
        school_year: submission.school_year,
        teaches_cs: params[:override],
      )
      unless override.valid?
        render json: {
          error_message: "Unable to create CensusOverride",
          errors: override.errors,
        }, status: :bad_request
        return
      end
    end

    investigation = Census::CensusInaccuracyInvestigation.new(
      user: current_user,
      notes: params[:notes],
      census_submission: submission,
      census_override: override,
    )
    unless investigation.valid?
      render json: {
        error_message: "Unable to create CensusInaccuracyInvestigation",
        errors: investigation.errors,
      }, status: :bad_request
      return
    end
    investigation.save!

    render json: {
      census_inaccuracy_investigation_id: investigation.id,
      census_override_id: override.try(:id),
    }, status: :created
  end
end
