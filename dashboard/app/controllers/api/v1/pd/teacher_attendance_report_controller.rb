class Api::V1::Pd::TeacherAttendanceReportController < Api::V1::Pd::ReportControllerBase
  include Pd::WorkshopFilters

  authorize_resource class: :pd_teacher_attendance_report

  # GET /api/v1/pd/teacher_attendance_report
  # GET /api/v1/pd/teacher_attendance.csv
  def index
    @workshops = load_filtered_ended_workshops

    report = @workshops.flat_map do |workshop|
      workshop.enrollments.map do |enrollment|
        ::Pd::Summary::TeacherSummary.new(enrollment: enrollment).generate_teacher_summary_line_item
      end
    end

    respond_to do |format|
      format.json do
        render json: report
      end
      format.csv do
        send_as_csv_attachment report, 'teacher_attendance_report.csv'
      end
    end
  end
end
