class Api::V1::Pd::WorkshopSurveyFoormSubmissionsController < ApplicationController
  def create
    answers = params[:answers].to_json
    form_name = params[:form_name]
    form_version = params[:form_version]
    submission = ::Foorm::Submission.create(form_name: form_name, form_version: form_version, answers: answers)

    survey_submission = ::Pd::WorkshopSurveyFoormSubmission.new(
      foorm_submission_id: submission.id,
      user_id: params[:user_id],
      pd_session_id: params[:pd_session_id],
      pd_workshop_id: params[:pd_workshop_id],
      day: params[:day]
    )
    survey_submission.save!

    render json: {submission_id: submission.id, survey_submission_id: survey_submission.id}, status: :created
  end
end
