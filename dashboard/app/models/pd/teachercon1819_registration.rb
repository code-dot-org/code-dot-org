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

require 'cdo/shared_constants/pd/teachercon1819_registration_constants'

class Pd::Teachercon1819Registration < ActiveRecord::Base
  include Pd::Form
  include Teachercon1819RegistrationConstants

  belongs_to :pd_application, class_name: 'Pd::Application::ApplicationBase'

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  YES_OR_NO = [YES, NO].freeze
  OTHER = 'Other'.freeze

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
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:accept],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:withdraw_date],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:withdraw_other],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline],
      ],
      photoRelease: YES_OR_NO,
      liabilityWaiver: YES_OR_NO,
    }.freeze
  end

  def self.required_fields
    [
      :preferred_first_name,
      :last_name,
      :email,
      :phone,
      :teacher_accept_seat,
      :contact_first_name,
      :contact_last_name,
      :contact_relationship,
      :contact_phone,
      :dietary_needs,
      :live_far_away,
      :how_traveling,
      :need_hotel,
      :photo_release,
      :liability_waiver,
      :agree_share_contact,
    ].freeze
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    if hash.try(:[], :teacher_accept_seat) == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline]
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
