class Api::V1::Pd::WorkshopAttendanceSerializer < ActiveModel::Serializer
  attributes :state, :section_code, :session_attendances

  def section_code
    object.section.code
  end

  def session_attendances
    object.sessions.map do |session|
      Api::V1::Pd::SessionAttendanceSerializer.new(session).attributes
    end
  end
end
