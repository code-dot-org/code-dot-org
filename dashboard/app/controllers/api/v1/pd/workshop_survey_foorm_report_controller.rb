module Api::V1::Pd
  class WorkshopSurveyFoormReportController < ReportControllerBase
    include Pd::Foorm

    # GET /api/v1/pd/workshops/:id/foorm/generic_survey_report
    def generic_survey_report
      report = Pd::Foorm::SurveyReporter.get_workshop_report(params[:workshop_id])
      render json: report
    end
  end
end
