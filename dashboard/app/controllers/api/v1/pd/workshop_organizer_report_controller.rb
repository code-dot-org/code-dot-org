class Api::V1::Pd::WorkshopOrganizerReportController < Api::V1::Pd::ReportControllerBase
  authorize_resource class: 'Pd::WorkshopOrganizerReport'

  # TODO: date-filtering

  # GET /api/v1/pd/workshop_organizer_report
  # GET /api/v1/pd/workshop_organizer_report.csv
  def index
    report = ::Pd::WorkshopOrganizerReport.generate_organizer_report current_user

    respond_to do |format|
      format.json do
        render json: report, serializer: Api::V1::Pd::WorkshopOrganizerReportDataTableSerializer
      end
      format.csv do
        send_as_csv_attachment report, 'workshop_organizer_report.csv'
      end
    end
  end
end
