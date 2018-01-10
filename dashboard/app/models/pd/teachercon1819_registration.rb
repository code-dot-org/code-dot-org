# == Schema Information
#
# Table name: pd_teachercon1819_registrations
#
#  id                :integer          not null, primary key
#  pd_application_id :integer
#  form_data         :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_pd_teachercon1819_registrations_on_pd_application_id  (pd_application_id)
#

class Pd::Teachercon1819Registration < ActiveRecord::Base
  include Pd::Form

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  YES_OR_NO = [YES, NO].freeze
  OTHER = 'Other'.freeze

  TEACHER_ACCEPT_SEAT = "Yes, I accept my seat in the Professional Learning Program"
  TEACHER_DECLINE_SEAT = "No, I decline my seat in the Professional Learning Program."
  TEACHER_WITHDRAW_DATE = "Yes, I want to participate, but I'm unable to attend my assigned summer workshop date. Please place me on your waitlist. I understand that I am not guaranteed a space in a different summer workshop."
  TEACHER_WITHDRAW_OTHER = "Yes, I want to participate, but I'm not able to for a different reason. Please place me on your waitlist. I understand that I am not guaranteed a space in a different summer workshop."

  def self.options
    {
      dietaryNeeds: [
        'None',
        'Vegetarian',
        'Vegan',
        'Halal',
        'Gluten Free',
        'Food Allergy',
      ],
      liveFarAway: YES_OR_NO,
      addressState: get_all_states_with_dc.to_h.values,
      howTraveling: [
        'I will drive by myself',
        'I will carpool with another TeacherCon attendee',
        'Flying',
        'Amtrak or regional train service',
        'Public transit (e.g., city bus or light rail)',
      ],
      needHotel: YES_OR_NO,
      needAda: [YES, NO, 'Other (please explain):'],
      teacherAcceptSeat: [
        TEACHER_ACCEPT_SEAT,
        TEACHER_WITHDRAW_DATE,
        TEACHER_WITHDRAW_OTHER,
        TEACHER_DECLINE_SEAT,
      ],
      photoRelease: YES_OR_NO,
      liabilityWaiver: YES_OR_NO,
    }.freeze
  end

  def self.required_fields
    [
      :preferredFirstName,
      :lastName,
      :email,
      :phone,
      :teacherAcceptSeat,
      :contactFirstName,
      :contactLastName,
      :contactRelationship,
      :contactPhone,
      :dietaryNeeds,
      :liveFarAway,
      :howTraveling,
      :needHotel,
      :photoRelease,
      :liabilityWaiver,
      :agreeShareContact,
    ].freeze
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    if hash.try(:[], :teacher_accept_seat) == TEACHER_DECLINE_SEAT
      # then we don't care about the rest of the fields
      return
    end

    super
  end

  def dynamic_required_fields(hash)
    requireds = []
    if hash[:live_far_away] == YES
      requireds.concat [
        :address_street,
        :address_city,
        :address_state,
        :address_zip
      ]
    end

    if hash[:need_hotel] == YES
      requireds.concat [
        :need_ada
      ]
    end

    return requireds
  end
end
