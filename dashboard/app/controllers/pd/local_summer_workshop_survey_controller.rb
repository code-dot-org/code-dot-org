class Pd::LocalSummerWorkshopSurveyController < ApplicationController
  load_and_authorize_resource :pd_enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  def new
    #authorize! :create, Pd::LocalSummerWorkshopSurvey

    begin
      @day = params.require(:day).to_i
    rescue ActionController::ParameterMissing
      redirect_to day: 1
      return
    end

    # TODO: confirm enrollment is of the proper type

    puts @pd_enrollment.code

    if Pd::LocalSummerWorkshopSurvey.exists?(pd_enrollment_id: @pd_enrollment.id, day: @day)
      @survey = Pd::LocalSummerWorkshopSurvey.find_by(pd_enrollment: @pd_enrollment, day: @day)
      render :submitted
      return
    end

    @script_data = {
      options: Pd::LocalSummerWorkshopSurvey.options.camelize_keys.to_json,
      day: @day,
    }
  end
end
