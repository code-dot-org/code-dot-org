class Api::V1::Pd::WorkshopK5MapSerializer < ActiveModel::Serializer
  attributes :id, :location_name, :location_address, :sessions

  def sessions
    object.sessions.map(&:formatted_date_with_start_and_end_times)
  end
end
