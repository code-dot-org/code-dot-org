class Api::V1::Pd::WorkshopSurveysController < Api::V1::Pd::FormsController
  load_and_authorize_resource :pd_enrollment, class: '::Pd::Enrollment', find_by: 'code',
    id_param: :pd_enrollment_code

  def new_form
    @pd_enrollment.survey_class.new(
      pd_enrollment: @pd_enrollment
    )
  end
end
