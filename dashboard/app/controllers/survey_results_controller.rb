class SurveyResultsController < ApplicationController

  def create
    # puts params[:survey].to_json
    @survey_result = SurveyResult.new(survey_result_params)

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
    params.require(:survey).permit(:survey2016_ethnicity_indian, :survey2016_ethnicity_indian, :survey2016_ethnicity_asian, :survey2016_ethnicity_black, :survey2016_ethnicity_hispanic, :survey2016_ethnicity_hawaiian, :survey2016_ethnicity_white, :survey2016_foodstamps)
  end

end
