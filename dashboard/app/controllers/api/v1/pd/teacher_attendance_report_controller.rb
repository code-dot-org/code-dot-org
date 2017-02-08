class Api::V1::Pd::TeacherAttendanceReportController < Api::V1::Pd::ReportControllerBase
  include Pd::WorkshopFilters

  authorize_resource class: :pd_teacher_attendance_report

  # GET /api/v1/pd/teacher_progress_report
  # GET /api/v1/pd/teacher_progress_report.csv
  def index
    @workshops = load_filtered_ended_workshops

    report = @workshops.map do |workshop|
      # TODO(aoby): These workshops are being skipped so as to prevent an
      # exception from happening when we try to process a user with no account.
      # Fix this exception and remove this `next` statement.
      next unless workshop.account_required_for_attendance?

      ::Pd::Payment::PaymentFactory.get_payment(workshop).try do |workshop_summary|
        workshop_summary.teacher_summaries.map do |teacher_summary|
          teacher_summary.generate_teacher_progress_report_line_item(current_user.admin?)
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
