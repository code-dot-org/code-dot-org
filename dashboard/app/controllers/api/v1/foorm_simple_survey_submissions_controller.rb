class Api::V1::FoormSimpleSurveySubmissionsController < ApplicationController
  def create
    answers = params[:answers]

    submission = ::Foorm::SimpleSurveySubmission.new(
      user_id: params[:user_id],
      simple_survey_form_id: params[:simple_survey_form_id]
    )
    begin
      submission.save_with_foorm_submission(answers.to_json, params[:form_name], params[:form_version])
    rescue ActiveRecord::ActiveRecordError => e
      render json: {error: e.message}, status: :bad_request
      return
    end

    render json: {
      foorm_submission_id: submission.foorm_submission_id,
      simple_survey_submission_id: submission.id,
      simple_survey_form_id: submission.simple_survey_form_id
    }, status: :created
  end
end
