require 'csv'
require 'json'
require_relative '../../../lib/cdo/google/drive'

module DataIOHelper
  # @param data [Hash]
  # @param file_name [string]
  def write_to_json(data, file_name)
    File.open(file_name, 'w') do |f|
      f.write JSON.pretty_generate(data)
    end
  end

  # @param file_name [string]
  # @return Hash
  def read_from_json(file_name)
    file_content = File.read(file_name)
    JSON.parse(file_content)
  end

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
      rows.each { |row| csv << row }
    end
  end

  # @param rows [Array<Array>]
  # @param spreadsheet_path [string]
  # @param sheet_name [string]
  # @param credential_json [string]
  def write_to_gsheet(rows, spreadsheet_path, sheet_name, credential_json)
    raise 'Invalid inputs' if rows.nil? || spreadsheet_path.empty? || sheet_name.empty? || credential_json.empty?

    @gdrive_export_secret ||= read_from_json(credential_json)['gdrive_export_secret']
    @google_drive ||= Google::Drive.new(service_account_key: StringIO.new(@gdrive_export_secret.to_json))
    @google_drive.add_sheet_to_spreadsheet(rows, spreadsheet_path, sheet_name)
  end
end
