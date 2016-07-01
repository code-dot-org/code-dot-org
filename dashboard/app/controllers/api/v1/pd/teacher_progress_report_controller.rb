class Api::V1::Pd::TeacherProgressReportController < Api::V1::Pd::ReportControllerBase
  authorize_resource class: 'Pd::WorkshopOrganizerReport'

  # TODO: date-filtering

  # GET /api/v1/pd/teacher_progress_report
  # GET /api/v1/pd/teacher_progress_report.csv
  def index
    report = ::Pd::TeacherProgressReport.generate_report_for_user current_user

    respond_to do |format|
      format.json {render json: report, serializer: Api::V1::Pd::TeacherProgressReportDataTableSerializer}
      format.csv {send_as_csv_attachment report, 'teacher_progress_report.csv'}
    end
  end
end
