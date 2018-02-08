# Provides helper functions for a controller to serialize to json and convert to
# csv which can be sent as an attachment.
# It also defaults the controller format to json, unless csv is specified explicitly.
module Api::CsvDownload
  extend ActiveSupport::Concern

  included do
    before_action :default_to_json
  end
  def default_to_json
    request.format = :json unless request.format.csv?
  end

  # Behaves like 'render json: items, each_serializer:...',
  # but it returns the serialized json instead of rendering it in the response.
  def render_to_json(items, each_serializer:)
    items.map do |item|
      each_serializer.new(item).attributes
    end
  end

  # Generates csv from an array of hashes (see #generate_csv below) and sends it as an attachment (download).
  # @param [Array] json_array - array of hashes
  # @param [String] filename
  # @param [Boolean] :titleize (optional, default true) - when true, titleize the column headers
  def send_as_csv_attachment(json_array, filename, titleize: true)
    send_csv_attachment generate_csv(json_array, titleize: titleize), filename
  end

  # Sends a csv (text) as a downloadable attachment
  # @param [String] csv text
  # @param [String] filename
  def send_csv_attachment(csv, filename)
    send_data csv, type: 'text/csv', disposition: 'attachment', filename: filename
  end

  # Converts an array of hashes to csv
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
  def generate_csv(json_array, titleize: true)
    cols = nil
    CSV.generate(headers: true) do |csv|
      json_array.each do |json_row|
        unless cols
          cols = json_row.keys
          csv << cols.map {|col| titleize ? titleize_with_id(col) : col}
        end
        csv << cols.map {|col| json_row[col]}
      end
    end
  end

  # Similar to String.titleize (http://apidock.com/rails/String/titleize),
  # but it takes a symbol or string and doesn't strip the trailing '_id'
  #
  #   'account_id'.titleize == 'Account'
  #   titleize_with_id('account_id') == 'Account Id'
  #   titleize_with_id(:account_id) == 'Account Id'
  #
  # @return [String]
  def titleize_with_id(word)
    stringified = word.to_s
    stringified.titleize + (stringified.end_with?('_id') ? ' Id' : '')
  end
end
