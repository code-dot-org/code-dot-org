# == Schema Information
#
# Table name: pd_fit_weekend1819_registrations
#
#  id                :integer          not null, primary key
#  pd_application_id :integer
#  form_data         :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_pd_fit_weekend1819_registrations_on_pd_application_id  (pd_application_id)
#

class Pd::FitWeekend1819Registration < ActiveRecord::Base
  include Pd::Form

  belongs_to :pd_application, class_name: 'Pd::Application::ApplicationBase'

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  YES_OR_NO = [YES, NO].freeze

  def self.options
    {
      ableToAttend: YES_OR_NO,
      dietaryNeeds: [
        'None',
        'Vegetarian',
        'Vegan',
        'Halal',
        'Gluten Free',
        'Food Allergy (please list):',
      ],
      liveFarAway: YES_OR_NO,
      addressState: get_all_states_with_dc.to_h.values,
      howTraveling: [
        'I will drive by myself',
        'I will carpool with another FiT Weekend attendee',
        'Flying',
        'Amtrak or regional train service',
        'Public transit (e.g., city bus or light rail)',
      ],
      needHotel: YES_OR_NO,
      needAda: [YES, NO, "Other (please explain):"],
      photoRelease: [YES],
      liabilityWaiver: [YES],
    }.freeze
  end

  def self.required_fields
    [
      :preferred_first_name,
      :last_name,
      :email,
      :phone,
      :able_to_attend,
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

    if hash.try(:[], :able_to_attend) == NO
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
