module Api::V1::Pd
  class WorkshopOrganizerSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    include ::Pd::WorkshopSurveyReportCsvConverter

    authorize_resource class: :workshop_organizer_survey_report

    # GET /api/v1/pd/workshop_organizer_survey_report_for_course/:course
    def index
      workshops = ::Pd::Workshop.where(course: params[:course], organizer_id: current_user.id).in_state(::Pd::Workshop::STATE_ENDED).reject {|w| w.local_summer? || w.teachercon?}

      survey_report = generate_summary_report(
        workshop: nil,
        workshops: workshops,
        course: params[:course],
        facilitator_breakdown: true
      )

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
