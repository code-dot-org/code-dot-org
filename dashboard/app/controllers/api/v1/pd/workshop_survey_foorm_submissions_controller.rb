class Api::V1::Pd::WorkshopSurveyFoormSubmissionsController < ApplicationController
  def create
    answers = params[:answers]

    # save facilitator answers as separate survey submissions
    # for ease of querying per-facilitator data
    facilitator_answers = answers["facilitators"]
    answers.delete("facilitators")

    pd_session_id = params[:pd_session_id].blank? ? nil : params[:pd_session_id].to_i
    day = params[:day].blank? ? nil : params[:day].to_i
    form_name = params[:form_name].presence

    if Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(
      params[:user_id].to_i,
      params[:pd_workshop_id].to_i,
      pd_session_id,
      day,
      form_name
    )
      return render json: {error: 'User has already submitted a response'}, status: :conflict
    end

    survey_submission = ::Pd::WorkshopSurveyFoormSubmission.new(
      user_id: params[:user_id],
      pd_session_id: params[:pd_session_id],
      pd_workshop_id: params[:pd_workshop_id],
      day: params[:day]
    )
    begin
      survey_submission.save_with_foorm_submission(answers.to_json, params[:form_name], params[:form_version])
    rescue ActiveRecord::ActiveRecordError => e
      render json: {error: e.message}, status: :bad_request
      return
    end

    facilitator_save_result = save_facilitator_questions(facilitator_answers, params)

    if facilitator_save_result[:save_success]
      render json: {submission_id: survey_submission.foorm_submission_id, survey_submission_id: survey_submission.id}, status: :created
    else
      render json: {error: e.message}, status: :bad_request
    end
  end

  # save each set of facilitator questions (split per facilitator)
  # as a separate survey submission
  def save_facilitator_questions(facilitator_answers, params)
    save_success = true
    error = nil
    submission_ids = []
    survey_submission_ids = []
    if facilitator_answers
      facilitator_answers.each do |_, data|
        next unless data["facilitatorId"]
        survey_submission = ::Pd::WorkshopSurveyFoormSubmission.new(
          user_id: params[:user_id],
          pd_session_id: params[:pd_session_id],
          pd_workshop_id: params[:pd_workshop_id],
          day: params[:day],
          facilitator_id: data["facilitatorId"]
        )
        begin
          survey_submission.save_with_foorm_submission(data.to_json, params[:form_name], params[:form_version])
          submission_ids << survey_submission.foorm_submission_id
          survey_submission_ids << survey_submission.id
        rescue ActiveRecord::ActiveRecordError => e
          save_success = true
          error = e.message
        end
      end
    end
    {
      save_success: save_success,
      error: error,
      submission_ids: submission_ids,
      survey_submission_ids: survey_submission_ids
    }
  end
end
