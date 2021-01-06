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

# NOTE: Unlike the other year-specific FiT Weekend Registration classes (Pd::FitWeekend1920Registration),
# this class is in its own table and does not inherit from Pd::FitWeekendRegistrationBase.
class Pd::FitWeekend1819Registration < ApplicationRecord
  include Pd::Form

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  YES_OR_NO = [YES, NO].freeze

  belongs_to :pd_application, class_name: 'Pd::Application::ApplicationBase'

  after_create :update_application_status
  after_create :send_fit_weekend_confirmation_email

  def update_application_status
    pd_application.update!(status: 'withdrawn') unless accepted?
  end

  def send_fit_weekend_confirmation_email
    Pd::FitWeekendRegistrationMailer.confirmation(self).deliver_now
  end

  def self.options
    {
      ableToAttend: YES_OR_NO,
      dietaryNeeds: [
        'None',
        'Vegetarian',
        'Vegan',
        'Kosher',
        'Halal',
        'Gluten Free',
        'Food Allergy',
      ],
      liveFarAway: YES_OR_NO,
      addressState: get_all_states_with_dc.to_h.values,
      howTraveling: [
        'I will drive by myself',
        'I will carpool with another FiT Weekend attendee (Please note who)',
        'Flying',
        'Amtrak or regional train service',
        'Public transit (e.g., city bus or light rail)',
      ],
      needHotel: YES_OR_NO,
      needAda: YES_OR_NO,
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

    if hash[:dietary_needs].try(:include?, 'Food Allergy')
      requireds.concat [
        :dietary_needs_details
      ]
    end

    return requireds
  end

  def accepted?
    sanitize_form_data_hash.try(:[], :able_to_attend) == YES
  end

  # Simplified string representing whether the registrant accepted the fit seat
  # While this could be a bool, we are using strings for parity with Teachercon1819Registration
  # which has more complex answers.
  def accepted_seat_simplified
    accepted? ? 'Yes' : 'No'
  end

  def course_name
    pd_application.try(&:course_name)
  end

  # at time of registration
  def fit_city
    sanitize_form_data_hash[:city]
  end
end
