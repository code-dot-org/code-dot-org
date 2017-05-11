class Pd::LocalSummerWorkshopSurveyController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  def new
    #authorize! :create, Pd::LocalSummerWorkshopSurvey

    # TODO: confirm enrollment is of the proper type

    if Pd::LocalSummerWorkshopSurvey.exists?(pd_enrollment_id: @pd_enrollment.id)
      #@survey = Pd::LocalSummerWorkshopSurvey.find_by(pd_enrollment: @pd_enrollment)
      render :submitted
      return
    end

    @script_data = {
      options: Pd::LocalSummerWorkshopSurvey.options.camelize_keys.to_json,
      pdEnrollmentCode: @pd_enrollment.code.to_json,
      facilitatorNames: @pd_enrollment.workshop.facilitators.map(&:name).to_json
    }
  end
end
