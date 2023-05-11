require 'csv'
require 'google_drive'
require 'json'

#
# A helper module for reading/writing data to/from JSON, CSV, and Google spreadsheet (gsheet).
#
module DataIOHelper
  # @param data [Hash]
  # @param file_name [string]
  def write_to_json(data, file_name)
    File.write(file_name, JSON.pretty_generate(data))
  end

  # @param file_name [string]
  # @return Hash
  def read_from_json(file_name)
    file_content = File.read(file_name)
    JSON.parse(file_content)
  end

  # Create CSV rows with headers from an array of hashes.
  # @param data_array [Array<Hash>]
  # @return Array<Array>
  def convert_to_csv_rows(data_array)
    return [] if data_array.nil? || data_array.empty?
    [].tap do |csv|
      csv << data_array.first.keys    # headers
      data_array.each do |hash|
        csv << hash.values
      end
    end
  end

  # @param rows [Array<Array>]
  # @param file_name [string]
  def write_to_csv(rows, file_name)
    return if rows.nil? || rows.empty?
    CSV.open(file_name, 'w') do |csv|
      rows.each {|row| csv << row}
    end
  end

  # Append data to a Google spreadsheet.
  # The spreadsheet must exists.
  # @param rows_with_headers [Array<Array>]
  # @param spreadsheet_name [String]
  # @param sheet_name [String]
  # @credential_json [String] Google credential json file
  def append_to_gsheet(rows_with_headers, spreadsheet_name, sheet_name, credential_json, overwrite = false)
    raise 'Input params cannot be nil or empty!' if rows_with_headers.nil? || spreadsheet_name.empty? || sheet_name.empty? || credential_json.empty?
    @gdrive_session ||= GoogleDrive::Session.from_service_account_key(credential_json)

    spreadsheet = @gdrive_session.spreadsheet_by_title(spreadsheet_name)
    raise "#{spreadsheet_name} gsheet doesn't exist!" if spreadsheet.nil?

    worksheet = spreadsheet.worksheet_by_title(sheet_name)
    worksheet ||= spreadsheet.add_worksheet(sheet_name, 200)

    if overwrite
      worksheet.delete_rows(1, worksheet.num_rows)
      worksheet.update_cells(1, 1, rows_with_headers)
    else
      # Delete new data headers if the worksheet already has data
      rows_with_headers.shift if worksheet.num_rows > 0
      worksheet.insert_rows(worksheet.num_rows + 1, rows_with_headers)
    end
    worksheet.save
  end
end
