class Api::V1::Pd::PreWorkshopSurveysController < Api::V1::Pd::FormsController
  load_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :pd_enrollment_code, only: :new_form

  load_and_authorize_resource :pd_workshop, class: 'Pd::Workshop', only: :show

  def new_form
    Pd::PreWorkshopSurvey.new(
      pd_enrollment: @pd_enrollment
    )
  end

  def show
    render json: @pd_workshop.pre_workshop_surveys.pluck(:form_data)
  end
end
