class Api::V1::Pd::WorkshopAttendanceSerializer < ActiveModel::Serializer
  attributes :state, :session_attendances

  def session_attendances
    object.sessions.map do |session|
      Api::V1::Pd::SessionAttendanceSerializer.new(session).attributes
    end
  end
end
