class Api::V1::Pd::LocalSummerWorkshopSurveysController < ApplicationController
  authorize_resource class: 'Pd::LocalSummerWorkshopSurvey', only: :create

  def create
    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    day = params.require(:day)
    pd_enrollment_id = params.require(:pd_enrollment_id)

    #TODO: make sure that the specified enrollment is for the current user

    local_summer_workshop_survey = ::Pd::LocalSummerWorkshopSurvey.new(
      pd_enrollment_id: pd_enrollment_id,
      day: day,
      form_data: form_data_json
    )

    if local_summer_workshop_survey.persisted?
      render json: {id: local_summer_workshop_survey.id}, status: :created
    else
      render json: {errors: local_summer_workshop_survey.errors.messages}, status: :bad_request
    end
  end
end
