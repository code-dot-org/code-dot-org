require 'pd/foorm/survey_results.rb'
module Api::V1::Pd
  class WorkshopSurveyFoormReportController < ReportControllerBase
    include Pd::Foorm

    # GET /api/v1/pd/foorm/workshops/:id/generic_survey_report
    def generic_survey_report
      parsed_forms, summarized_answers = SurveyResults.get_summary_for_workshop(params[:id])
      render json: {questions: parsed_forms, answers: summarized_answers}
    end
  end
end
