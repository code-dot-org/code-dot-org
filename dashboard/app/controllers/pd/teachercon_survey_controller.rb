class Pd::TeacherconSurveyController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  def new
    if Pd::TeacherconSurvey.exists?(pd_enrollment_id: @pd_enrollment.id)
      render :submitted
      return
    end

    workshop = @pd_enrollment.workshop

    @unit_data = {
      props: {
        apiEndpoint: "/api/v1/pd/teachercon_surveys",
        facilitatorNames: workshop.facilitators.map(&:name),
        course: workshop.course,
        subject: workshop.subject,
        options: Pd::TeacherconSurvey.options.camelize_keys,
        requiredFields: Pd::TeacherconSurvey.camelize_required_fields,
        pdEnrollmentCode: @pd_enrollment.code,
      }.to_json
    }
  end
end
