class SurveyResultsController < ApplicationController
  before_action :authenticate_user!

  def create
    @survey_result = SurveyResult.new(survey_result_params)
    @survey_result.user_id = current_user.id

    respond_to do |format|
      if @survey_result.save
        format.json {head :ok}
      else
        format.json {render json: @survey_result.errors, status: :unprocessable_entity}
      end
    end
  end

  # Never trust parameters from the scary internet, only allow the white list
  # through. Also sanitize the parameters to only contain UTF-8 and truncate as
  # necessary.
  def survey_result_params
    whitelisted_params = params.require(:survey).
                         permit(SurveyResult::ALL_ATTRS.map(&:to_sym) + [:kind])
    whitelisted_params.each do |k, v|
      whitelisted_params[k] = v.force_encoding('BINARY').encode(
        'utf-8',
        invalid: :replace,
        undef: :replace
      )
    end
    if whitelisted_params[:nps_comment] &&
       whitelisted_params[:nps_comment].length > 1000
      whitelisted_params[:nps_comment] = whitelisted_params[:nps_comment].
                                         truncate(1000)
    end
    whitelisted_params
  end
end
