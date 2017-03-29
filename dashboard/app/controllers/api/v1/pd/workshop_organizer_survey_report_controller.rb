module Api::V1::Pd
  class WorkshopOrganizerSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    include ::Pd::WorkshopSurveyReportCsvConverter

    authorize_resource class: :workshop_organizer_survey_report

    # GET /api/v1/pd/workshop_organizer_survey_report_for_course/:course
    def index
      survey_report = Hash.new

      aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[params[:course]]

      survey_report[:all_my_workshops_for_course], facilitator_scores = get_score_for_workshops(
        ::Pd::Workshop.where(course: params[:course], organizer_id: current_user.id).in_state(::Pd::Workshop::STATE_ENDED), facilitator_breakdown: true
      )
      survey_report.merge!(facilitator_scores)

      respond_to do |format|
        format.json do
          render json: survey_report
        end
        format.csv do
          csv_report = convert_to_csv survey_report
          send_as_csv_attachment(csv_report, 'workshop_organizer_survey_report.csv', titleize: false)
        end
      end
    end
  end
end
