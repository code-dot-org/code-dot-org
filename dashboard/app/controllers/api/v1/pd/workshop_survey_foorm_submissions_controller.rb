class Api::V1::Pd::WorkshopSurveyFoormSubmissionsController < ApplicationController
  def create
    answers = params[:answers].to_json

    survey_submission = ::Pd::WorkshopSurveyFoormSubmission.new(
      user_id: params[:user_id],
      pd_session_id: params[:pd_session_id],
      pd_workshop_id: params[:pd_workshop_id],
      day: params[:day]
    )
    begin
      survey_submission.save_with_foorm_submission(answers, params[:form_name], params[:form_version])
    rescue ActiveRecord::ActiveRecordError => e
      render json: {error: e.message}, status: :bad_request
      return
    end

    render json: {submission_id: survey_submission.foorm_submission_id, survey_submission_id: survey_submission.id}, status: :created
  end
end
