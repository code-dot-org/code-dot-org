module Api::V1::Pd
  class WorkshopOrganizerSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer

    authorize_resource class: :workshop_organizer_survey_report

    def index
      survey_report = Hash.new

      survey_report[:all_my_workshops_for_course], facilitator_scores = get_score_for_workshops(
        ::Pd::Workshop.where(course: params[:course], organizer_id: current_user.id), facilitator_breakdown: true)
      survey_report.merge!(facilitator_scores)

      aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[params[:course]]

      render json: survey_report
    end
  end
end
