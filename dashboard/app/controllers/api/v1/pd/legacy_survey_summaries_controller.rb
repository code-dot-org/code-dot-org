module Api::V1::Pd
  class LegacySurveySummariesController < ReportControllerBase
    include Pd::Foorm

    # GET /api/v1/pd/legacy_survey_summaries
    def legacy_survey_summaries
      report = Pd::Foorm::LegacySurveySummaries.get_summaries(current_user)
      render json: report
    end
  end
end
