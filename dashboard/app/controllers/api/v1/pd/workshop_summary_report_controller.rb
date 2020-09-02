class Api::V1::Pd::WorkshopSummaryReportController < Api::V1::Pd::ReportControllerBase
  authorize_resource class: :pd_workshop_summary_report
  include Pd::WorkshopFilters

  # GET /api/v1/pd/workshop_organizer_report
  # GET /api/v1/pd/workshop_organizer_report.csv
  def index
    @workshops = load_filtered_ended_workshops

    report = @workshops.map do |workshop|
      ::Pd::Payment::PaymentFactory.get_payment(workshop).try do |workshop_summary|
        workshop_summary.generate_organizer_report_line_item(current_user.permission?(UserPermission::WORKSHOP_ADMIN))
      end
    end.compact

    respond_to do |format|
      format.json do
        render json: report
      end
      format.csv do
        send_as_csv_attachment report, 'workshop_organizer_report.csv'
      end
    end
  end
end
