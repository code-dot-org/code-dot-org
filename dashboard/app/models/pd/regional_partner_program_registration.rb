# == Schema Information
#
# Table name: pd_regional_partner_program_registrations
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  form_data  :text(65535)
#  teachercon :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_reg_part_prog_reg_on_user_id_and_teachercon  (user_id,teachercon)
#

class Pd::RegionalPartnerProgramRegistration < ActiveRecord::Base
  include Pd::ProgramRegistrationForm

  def required_fields
    [
      :confirm_teachercon_date,
      :full_name,
      :email,
      :contact_name,
      :contact_relationship,
      :contact_phone,
      :dietary_needs,
      :live_far_away,
      :how_traveling,
      :need_hotel,
      :need_ada,
      :photo_release,
      :liability_waiver,
    ].freeze
  end

  NO = 'No'

  def self.options
    Pd::ProgramRegistrationForm::TRAVEL_OPTIONS.
      merge(Pd::ProgramRegistrationForm::PHOTO_RELEASE_OPTIONS).
      merge(Pd::ProgramRegistrationForm::LIABILITY_WAIVER_OPTIONS).
      merge(
        {
          confirm_teachercon_date: [
            'Yes',
            NO
          ]
        }
      ).freeze
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    if hash.try(:[], :confirm_teachercon_date) == NO
      # then we only care about getting the "why not" feedback
      add_key_error(:decline_teachercon_notes) unless hash.key?(:decline_teachercon_notes)
      return
    end

    super
  end
end
