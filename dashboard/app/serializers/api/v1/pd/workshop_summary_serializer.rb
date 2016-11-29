class Api::V1::Pd::WorkshopSummarySerializer < ActiveModel::Serializer
  attributes :state, :section_code, :sessions

  def section_code
    object.section.try(:code)
  end

  def sessions
    object.sessions.map do |session|
      Api::V1::Pd::SessionSerializer.new(session).attributes
    end
  end
end
