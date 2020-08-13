class Api::V1::Pd::WorkshopSurveyFoormSubmissionsController < ApplicationController
  include Pd::WorkshopSurveyFoormConstants
  def create
    answers = params[:answers]

    # save facilitator answers as separate survey submissions
    # for ease of querying per-facilitator data
    facilitator_answers = answers[Pd::WorkshopSurveyFoormConstants::FACILITATORS]
    answers.delete(Pd::WorkshopSurveyFoormConstants::FACILITATORS)

    pd_session_id = params[:pd_session_id].blank? ? nil : params[:pd_session_id].to_i
    day = params[:day].blank? ? nil : params[:day].to_i
    form_name = params[:form_name].presence
    # agenda will be blank if none was provided, we would like to store it as null
    workshop_agenda = params[:workshop_agenda].presence

    if Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(
      params[:user_id].to_i,
      params[:pd_workshop_id].to_i,
      pd_session_id,
      day,
      form_name,
      workshop_agenda
    )
      return render json: {error: 'User has already submitted a response'}, status: :conflict
    end

    survey_submission = ::Pd::WorkshopSurveyFoormSubmission.new(
      user_id: params[:user_id],
      pd_session_id: params[:pd_session_id],
      pd_workshop_id: params[:pd_workshop_id],
      day: params[:day],
      workshop_agenda: workshop_agenda
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
        # data needs to have facilitator id
        next unless data[Pd::WorkshopSurveyFoormConstants::FACILITATOR_ID]
        # If data only contains metadata, do not store, as there were no answers for this facilitator.
        next if data.except(Pd::WorkshopSurveyFoormConstants::FACILITATOR_ID,
          Pd::WorkshopSurveyFoormConstants::FACILITATOR_NAME,
          Pd::WorkshopSurveyFoormConstants::FACILITATOR_POSITION
        ).nil_or_empty?
        survey_submission = ::Pd::WorkshopSurveyFoormSubmission.new(
          user_id: params[:user_id],
          pd_session_id: params[:pd_session_id],
          pd_workshop_id: params[:pd_workshop_id],
          day: params[:day],
          facilitator_id: data[Pd::WorkshopSurveyFoormConstants::FACILITATOR_ID]
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
