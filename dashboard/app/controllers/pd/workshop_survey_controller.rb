class Pd::WorkshopSurveyController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  def new
    if Pd::WorkshopSurvey.exists?(pd_enrollment_id: @pd_enrollment.id)
      render :submitted
      return
    end

    workshop = @pd_enrollment.workshop

    user_surveys = Pd::WorkshopSurvey.find_by_user(@pd_enrollment.user)
    is_first_survey = user_surveys.empty?

    @script_data = {
      props: {
        options: @pd_enrollment.survey_class.options.camelize_keys,
        requiredFields: @pd_enrollment.survey_class.camelize_required_fields,
        pdEnrollmentCode: @pd_enrollment.code,
        facilitatorNames: workshop.facilitators.map(&:name),
        course: workshop.course,
        subject: workshop.subject,
        isFirstSurvey: is_first_survey,
        apiEndpoint: "/api/v1/pd/workshop_surveys"
      }.to_json
    }
  end
end
