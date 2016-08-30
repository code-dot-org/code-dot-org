# Provides helper functions for a controller to serialize to json and convert to
# csv which can be sent as an attachment.
# It also defaults the controller format to json, unless csv is specified explicitly.
module CsvDownload
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

  # Generates csv from an array of hashes (see below) and sends it as an attachment (download).
  def send_as_csv_attachment(json_array, filename)
    send_data generate_csv(json_array), type: 'text/csv', disposition: 'attachment', filename: filename
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
  def generate_csv(json_array)
    cols = nil
    CSV.generate(headers: true) do |csv|
      json_array.each do |json_row|
        unless cols
          cols = json_row.keys
          csv << cols.map(&:to_s).map(&:titleize)
        end
        csv << cols.map {|col| json_row[col]}
      end
    end
  end
end
