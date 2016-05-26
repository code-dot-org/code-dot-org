class Api::V1::Pd::ReportControllerBase < ::ApplicationController
  before_filter :default_to_json

  def default_to_json
    request.format = :json unless request.format.csv?
  end

  def send_as_csv_attachment(report, filename)
    send_data generate_csv(report), type: 'text/csv', disposition: 'attachment', filename: filename
  end

  # Converts a report array of hashes to csv
  # For example
  # -- from ---
  #   [
  #     {organizer_name: "Teacher1", district: "District1"},
  #     {organizer_name: "Teacher2", district: "District2"},
  #   ]
  # -- to ---
  #   Organizer Name,District
  #   Teacher1,District1
  #   Teacher2,District2
  def generate_csv(report)
    cols = nil
    CSV.generate(headers: true) do |csv|
      report.each do |report_row|
        unless cols
          cols = report_row.keys
          csv << cols.map(&:to_s).map(&:titleize)
        end
        csv << cols.map {|col| report_row[col]}
      end
    end
  end
end
