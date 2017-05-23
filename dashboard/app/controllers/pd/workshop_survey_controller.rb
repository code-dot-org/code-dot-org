class Pd::WorkshopSurveyController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  def new
    if Pd::WorkshopSurvey.exists?(pd_enrollment_id: @pd_enrollment.id)
      render :submitted
      return
    end

    workshop = @pd_enrollment.workshop

    user = @pd_enrollment.user
    user_surveys = Pd::WorkshopSurvey.
      joins(:pd_enrollment).
      where(pd_enrollments: {user_id: user.id})
    is_first_survey = user_surveys.count == 0

    @script_data = {
      options: @pd_enrollment.survey_class.options.camelize_keys.to_json,
      pd_enrollment_code: @pd_enrollment.code.to_json,
      facilitator_names: workshop.facilitators.map(&:name).to_json,
      course: workshop.course.to_json,
      subject: workshop.subject.to_json,
      is_first_survey: is_first_survey.to_json,
      api_endpoint: "/api/v1/pd/workshop_surveys".to_json
    }
  end
end
