class Api::V1::Pd::WorkshopK5MapSerializer < ActiveModel::Serializer
  attributes :id, :subject, :location_name, :location_address, :sessions, :processed_location

  def processed_location
    return nil unless object.processed_location
    JSON.parse(object.processed_location)
  end

  def sessions
    object.sessions.map(&:formatted_date_with_start_and_end_times)
  end
end
