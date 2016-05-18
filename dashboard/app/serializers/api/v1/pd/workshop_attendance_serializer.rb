class Api::V1::Pd::WorkshopAttendanceSerializer < ActiveModel::Serializer
  attributes :state, :admin_actions, :session_attendances

  def admin_actions
    scope.admin?
  end

  def session_attendances
    object.sessions.map do |session|
      Api::V1::Pd::SessionAttendanceSerializer.new(session).attributes
    end
  end
end
