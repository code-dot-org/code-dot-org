class Pd::PreWorkshopSurveyController < ApplicationController
  load_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  load_resource :workshop, class: 'Pd::Workshop', singleton: true, through: :pd_enrollment

  def new
    return render :submitted if Pd::PreWorkshopSurvey.exists?(pd_enrollment_id: @pd_enrollment.id)
    return render_404 unless @workshop.try(:pre_survey?)

    #form_json = File.read("config/forrms/surveys/pd/pre_workshop_survey.1.json")
    form_data = Forrm::Form.where(name: "surveys/pd/pre_workshop_survey", version: 1).first

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
        formData: @form_data
      }.to_json
    }
  end
end
