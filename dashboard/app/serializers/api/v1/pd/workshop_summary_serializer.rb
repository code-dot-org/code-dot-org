class Api::V1::Pd::WorkshopSummarySerializer < ActiveModel::Serializer
  attributes :state, :sessions, :account_required_for_attendance?, :course, :enrollment_count

  def sessions
    object.sessions.map do |session|
      Api::V1::Pd::SessionSerializer.new(session).attributes
    end
  end

  def enrollment_count
    object.enrollments.size
  end
end
