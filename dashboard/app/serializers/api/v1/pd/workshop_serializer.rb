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
  attributes :id, :organizer_id, :location_name, :location_address, :course,
    :subject, :capacity, :notes, :state, :facilitators,
    :enrolled_teacher_count, :sessions, :account_required_for_attendance?,
    :enrollment_code, :on_map, :funded, :funding_type, :ready_to_close?,
    :date_and_location_name, :regional_partner_name, :regional_partner_id,
    :scholarship_workshop?, :organizers

  def sessions
    object.sessions.map do |session|
      Api::V1::Pd::SessionSerializer.new(session).attributes
    end
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

  def regional_partner_name
    object.regional_partner.try(:name)
  end

  def organizers
    organizers = []

    # if there is a regional partner, only that partner's PMs can become the organizer
    # otherwise, any PM can become the organizer
    if object.regional_partner
      object.regional_partner.program_managers.each do |pm|
        organizers << {label: pm.name, value: pm.id}
      end
    else
      UserPermission.where(permission: UserPermission::PROGRAM_MANAGER).pluck(:user_id)&.map do |user_id|
        pm = User.find(user_id)
        organizers << {label: pm.name, value: pm.id}
      end
    end

    # any CSF facilitator can become the organizer of a CSF workshhop
    if object.course == Pd::Workshop::COURSE_CSF
      Pd::CourseFacilitator.where(course: Pd::Workshop::COURSE_CSF).pluck(:facilitator_id)&.map do |user_id|
        facilitator = User.find(user_id)
        organizers << {label: facilitator.name, value: facilitator.id}
      end
    end

    # workshop admins can become the organizer of any workshop
    UserPermission.where(permission: UserPermission::WORKSHOP_ADMIN).pluck(:user_id)&.map do |user_id|
      admin = User.find(user_id)
      organizers << {label: admin.name, value: admin.id}
    end

    organizers
  end
end
