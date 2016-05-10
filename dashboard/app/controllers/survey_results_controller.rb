class SurveyResultsController < ApplicationController
  before_filter :authenticate_user!

  def create
    @survey_result = SurveyResult.new(survey_result_params)
    @survey_result.user_id = current_user.id

    respond_to do |format|
      if @survey_result.save
        format.json { head :ok }
      else
        format.json { render json: @survey_result.errors, status: :unprocessable_entity }
      end
    end

  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def survey_result_params
    params.require(:survey).
      permit(SurveyResult::ALL_ATTRS.map(&:to_sym) + [:kind])
  end

end
