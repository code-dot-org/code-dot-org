class Api::V1::FoormMiscSurveySubmissionsController < ApplicationController
  def create
    answers = params[:answers]

    submission = ::Foorm::MiscSurvey.new(
      user_id: params[:user_id],
      misc_form_path: params[:misc_form_path]
    )
    begin
      submission.save_with_foorm_submission(answers.to_json, params[:form_name], params[:form_version])
    rescue ActiveRecord::ActiveRecordError => e
      render json: {error: e.message}, status: :bad_request
      return
    end

    render json: {foorm_submission_id: submission.foorm_submission_id, misc_survey_submission_id: submission.id}, status: :created
  end
end
