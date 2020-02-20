class Pd::PreWorkshopSurveyController < ApplicationController
  load_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  load_resource :workshop, class: 'Pd::Workshop', singleton: true, through: :pd_enrollment

  def new
    return render :submitted if Pd::PreWorkshopSurvey.exists?(pd_enrollment_id: @pd_enrollment.id)
    return render_404 unless @workshop.try(:pre_survey?)

    #form_json = File.read("config/foorms/surveys/pd/pre_workshop_survey.1.json")

    survey_name = "surveys/pd/pre_5_day_workshop_survey"
    latest_version = Foorm::Form.where(name: survey_name).maximum(:version)
    form_data = Foorm::Form.where(name: survey_name, version: latest_version).first
    @form_data = JSON.parse(form_data.questions)

    @workshop_date = @workshop.sessions.first.start.strftime('%-m/%-d/%y')
    @script_data = {
      props: {
        options: Pd::PreWorkshopSurvey.options.camelize_keys,
        requiredFields: Pd::PreWorkshopSurvey.camelize_required_fields,
        pdEnrollmentCode: @pd_enrollment.code,
        workshopDate: @workshop_date,
        unitsAndLessons: Pd::PreWorkshopSurvey.units_and_lessons(@workshop),
        apiEndpoint: "/api/v1/pd/pre_workshop_surveys",
        formData: @form_data,
        formName: survey_name,
        formVersion: latest_version
      }.to_json
    }
  end
end
