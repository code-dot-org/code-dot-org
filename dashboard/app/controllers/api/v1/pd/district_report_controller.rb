class Api::V1::Pd::DistrictReportController < Api::V1::Pd::ReportControllerBase
  authorize_resource class: 'Pd::DistrictReport'

  # TODO: date-filtering

  # GET /api/v1/pd/district_report
  # GET /api/v1/pd/district_report.csv
  def index
    districts = []
    if current_user.admin?
      districts = ::District.all
    elsif current_user.district_contact?
      districts = ::District.where(contact_id: current_user.id)
    end

    report = ::Pd::DistrictReport.generate_district_report districts

    respond_to do |format|
      format.json {render json: report, serializer: Api::V1::Pd::DistrictReportDataTableSerializer}
      format.csv {send_as_csv_attachment report, 'district_report.csv'}
    end
  end
end
