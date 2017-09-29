class Api::V1::Pd::PreWorkshopSurveysController < Api::V1::Pd::FormsController
  load_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :pd_enrollment_code

  def new_form
    Pd::PreWorkshopSurvey.new(
      pd_enrollment: @pd_enrollment
    )
  end
end
