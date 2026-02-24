class Api::V1::Pd::WorkshopSummaryReportController < Api::V1::Pd::ReportControllerBase
  authorize_resource class: :pd_workshop_summary_report
  include Pd::WorkshopFilters

  # GET /api/v1/pd/workshop_summary_report
  # GET /api/v1/pd/workshop_summary_report.csv
  def index
    @workshops = load_filtered_ended_workshops

    report = @workshops.map do |workshop|
      ::Pd::Summary::WorkshopSummary.new(workshop: workshop).generate_workshop_summary_line_item
    end

    respond_to do |format|
      format.json do
        render json: report
      end
      format.csv do
        send_as_csv_attachment report, 'workshop_summary_report.csv'
      end
    end
  end
end
