class Api::V1::Pd::WorkshopOrganizerReportController < Api::V1::Pd::ReportControllerBase
  authorize_resource class: :pd_workshop_organizer_report

  QUERY_BY_SCHEDULE = 'schedule'
  QUERY_BY_END = 'end'

  # GET /api/v1/pd/workshop_organizer_report
  # GET /api/v1/pd/workshop_organizer_report.csv
  def index
    # Default to the last week, by schedule
    end_date = params[:end] || Date.today
    start_date = params[:start] || end_date - 1.week
    query_by = params[:query_by] || QUERY_BY_SCHEDULE

    workshops = ::Pd::Workshop.in_state(::Pd::Workshop::STATE_ENDED)
    unless current_user.admin?
      workshops = workshops.organized_by current_user
    end

    if query_by == QUERY_BY_END
      workshops = workshops.end_on_or_after(start_date).end_on_or_before(end_date)
    else # assume by schedule
      workshops = workshops.start_on_or_after(start_date).start_on_or_before(end_date)
    end

    report = workshops.map do |workshop|
      ::Pd::Payment::PaymentFactory.get_payment(workshop).try do |workshop_summary|
        workshop_summary.generate_organizer_report_line_item(current_user.admin?)
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
