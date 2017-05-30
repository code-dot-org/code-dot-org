class Api::V1::Pd::WorkshopSurveysController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: '::Pd::Enrollment', find_by: 'code',
    id_param: :pd_enrollment_code

  def create
    form_data_hash = params.try(:[], :form_data) || {}

    workshop_survey = @pd_enrollment.survey_class.new(
      pd_enrollment: @pd_enrollment
    )
    workshop_survey.form_data_hash = form_data_hash
    workshop_survey.save

    if workshop_survey.valid?
      render json: {id: workshop_survey.id}, status: :created
    else
      render json: {errors: workshop_survey.errors.messages}, status: :bad_request
    end
  end
end
