# == Schema Information
#
# Table name: pd_workshops
#
#  id               :integer          not null, primary key
#  workshop_type    :string(255)      not null
#  organizer_id     :integer          not null
#  location_name    :string(255)
#  location_address :string(255)
#  course           :string(255)      not null
#  subject          :string(255)
#  capacity         :integer          not null
#  notes            :string(255)
#  section_id       :integer
#  started_at       :datetime
#  ended_at         :datetime
#  created_at       :datetime
#  updated_at       :datetime
#
# Indexes
#
#  index_pd_workshops_on_organizer_id  (organizer_id)
#

class Api::V1::Pd::WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :workshop_type, :organizer, :location_name, :location_address, :course,
    :subject, :capacity, :notes, :section_id, :section_code, :state, :facilitators, :enrolled_teacher_count,
    :sessions

  def section_code
    return nil unless object.section
    object.section.code
  end

  def sessions
    object.sessions.map do |session|
      Api::V1::Pd::SessionSerializer.new(session).attributes
    end
  end

  def organizer
    {name: object.organizer.name, email: object.organizer.email}
  end

  def facilitators
    object.facilitators.map do |facilitator|
      {name: facilitator.name, email: facilitator.email}
    end
  end

  def enrolled_teacher_count
    object.enrollments.count
  end
end
