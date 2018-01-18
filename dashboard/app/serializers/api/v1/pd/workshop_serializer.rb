# == Schema Information
#
# Table name: pd_workshops
#
#  id                  :integer          not null, primary key
#  organizer_id        :integer          not null
#  location_name       :string(255)
#  location_address    :string(255)
#  processed_location  :text(65535)
#  course              :string(255)      not null
#  subject             :string(255)
#  capacity            :integer          not null
#  notes               :text(65535)
#  section_id          :integer
#  started_at          :datetime
#  ended_at            :datetime
#  created_at          :datetime
#  updated_at          :datetime
#  processed_at        :datetime
#  deleted_at          :datetime
#  regional_partner_id :integer
#  on_map              :boolean
#  funded              :boolean
#
# Indexes
#
#  index_pd_workshops_on_organizer_id         (organizer_id)
#  index_pd_workshops_on_regional_partner_id  (regional_partner_id)
#

class Api::V1::Pd::WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :organizer, :location_name, :location_address, :course,
    :subject, :capacity, :notes, :state, :facilitators,
    :enrolled_teacher_count, :sessions, :account_required_for_attendance?,
    :enrollment_code, :on_map, :funded, :ready_to_close?, :date_and_location_name

  def sessions
    object.sessions.map do |session|
      Api::V1::Pd::SessionSerializer.new(session).attributes
    end
  end

  def organizer
    {id: object.organizer.id, name: object.organizer.name, email: object.organizer.email}
  end

  def facilitators
    object.facilitators.map do |facilitator|
      {id: facilitator.id, name: facilitator.name, email: facilitator.email}
    end
  end

  def enrolled_teacher_count
    object.enrollments.count
  end

  def enrollment_code
    @scope.try(:[], :enrollment_code)
  end
end
