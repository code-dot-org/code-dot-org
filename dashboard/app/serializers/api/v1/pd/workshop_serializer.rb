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
    :enrollment_code, :on_map, :funded, :funding_type, :ready_to_close?,
    :date_and_location_name, :regional_partner_name, :regional_partner_id,
    :scholarship_workshop?, :organizers

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

  def regional_partner_name
    object.regional_partner.try(:name)
  end

  def organizers
    organizers = UserPermission.where(permission: UserPermission::WORKSHOP_ADMIN).pluck(:user_id).map do |user_id|
      admin = User.find(user_id)
      {label: admin.name, value: admin.id}
    end

    if object.regional_partner
      object.regional_partner.program_managers.each do |pm|
        organizers << {label: pm.name, value: pm.id}
      end
    else
      UserPermission.where(permission: UserPermission::PROGRAM_MANAGER).pluck(:user_id).map do |user_id|
        pm = User.find(user_id)
        organizers << {label: pm.name, value: pm.id}
      end
    end

    organizers
    # should the current organizer be separately added to the list?
    # probably not - either they are in one of these caegories or they shouldn't be the organizer in future
    # admins << {label: object.organizer.name, value: object.organizer.id}

    # csd and csp
    # workshopAdmins and program managers for that regional partner (if there is one)
    # csf
    # workshopAdmins, program managers for that regional partner, and other csf facilitators?
  end
end
