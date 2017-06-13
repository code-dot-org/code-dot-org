class Api::V1::Pd::TeacherconSurveysController < Api::V1::Pd::FormsController
  load_and_authorize_resource :pd_enrollment, class: '::Pd::Enrollment', find_by: 'code',
    id_param: :pd_enrollment_code

  def new_form
    Pd::TeacherconSurvey.new(
      pd_enrollment: @pd_enrollment
    )
  end
end
