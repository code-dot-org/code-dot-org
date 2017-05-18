class Api::V1::Pd::WorkshopSurveysController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: '::Pd::Enrollment', find_by: 'code',
    id_param: :pd_enrollment_code

  def create
    form_data_hash = params.try(:[], :form_data) || {}
    form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4

    workshop_survey = @pd_enrollment.survey_class.create(
      pd_enrollment: @pd_enrollment,
      form_data: form_data_json
    )

    if workshop_survey.valid?
      render json: {id: workshop_survey.id}, status: :created
    else
      render json: {errors: workshop_survey.errors.messages}, status: :bad_request
    end
  end
end
