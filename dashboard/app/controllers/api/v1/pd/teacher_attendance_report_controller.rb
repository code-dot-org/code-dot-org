class Api::V1::Pd::TeacherAttendanceReportController < Api::V1::Pd::ReportControllerBase
  include Pd::WorkshopFilters

  authorize_resource class: :pd_teacher_attendance_report

  # GET /api/v1/pd/teacher_progress_report
  # GET /api/v1/pd/teacher_progress_report.csv
  def index
    @workshops = load_filtered_ended_workshops

    report = @workshops.map do |workshop|
      ::Pd::Payment::PaymentFactory.get_payment(workshop).try do |workshop_summary|
        workshop_summary.teacher_summaries.map do |teacher_summary|
          teacher_summary.generate_teacher_progress_report_line_item(
            current_user.permission?(UserPermission::WORKSHOP_ADMIN)
          )
        end
      end
    end.compact.flatten

    respond_to do |format|
      format.json do
        render json: report
      end
      format.csv do
        send_as_csv_attachment report, 'teacher_progress_report.csv'
      end
    end
  end
end
